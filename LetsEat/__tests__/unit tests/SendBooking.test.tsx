import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import BookingScreen from "../../app/(eatrequests)/booking";
import { getAuth } from "firebase/auth";
import { ref, onValue, get } from "firebase/database";
import { FIREBASE_DB } from "../../firebaseConfig";
import { useRouter } from "expo-router";

jest.mock("firebase/auth");
jest.mock("firebase/database");
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockGetAuth = getAuth as jest.Mock;
const mockRef = ref as jest.Mock;
const mockOnValue = onValue as jest.Mock;
const mockGet = get as jest.Mock;
const mockRouterPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({
  push: mockRouterPush,
  back: jest.fn(),
});

describe("BookingScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetAuth.mockReturnValue({
      currentUser: {
        uid: "currentUserId",
        email: "current@user.com",
      },
    });

    mockRef.mockImplementation((path: string) => path);

    mockOnValue.mockImplementation((ref: string, callback: Function) => {
      if (ref === "users/currentUserId/friendsList") {
        callback({
          val: () => ({
            friend1: { email: "friend1@test.com", username: "friend1" },
            friend2: { email: "friend2@test.com", username: "friend2" },
          }),
        });
      } else if (ref === "users/currentUserId") {
        callback({
          val: () => ({
            faculty: "Engineering",
            campusAccomodation: "Kent Ridge",
          }),
        });
      } else if (ref === "users") {
        callback({
          val: () => ({
            user1: {
              email: "user1@test.com",
              username: "user1",
              faculty: "Engineering",
              campusAccomodation: "Kent Ridge",
              status: "open",
            },
            user2: {
              email: "user2@test.com",
              username: "user2",
              faculty: "Engineering",
              campusAccomodation: "Kent Ridge",
              status: "open",
            },
          }),
        });
      }
    });

    mockGet.mockResolvedValue({
      exists: () => true,
      val: () => ({ faculty: "Engineering", campusAccomodation: "Kent Ridge" }),
    });
  });

  test("renders BookingScreen component", () => {
    const { getByPlaceholderText } = render(<BookingScreen />);
    expect(getByPlaceholderText("Search friends...")).toBeTruthy();
  });

  test("selects multiple friends and sends booking request", async () => {
    const { getByPlaceholderText, getByText, getAllByText } = render(
      <BookingScreen />
    );
    const searchInput = getByPlaceholderText("Search friends...");

    fireEvent.changeText(searchInput, "friend");
    fireEvent.press(getByText("Search"));

    await waitFor(() => {
      const friend1 = getByText("friend1");
      const friend2 = getByText("friend2");

      fireEvent.press(friend1);
      fireEvent.press(friend2);

      fireEvent.press(getByText("Book with Selected Friends"));
    });

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith({
        pathname: "./bookingdetails",
        params: {
          friends: JSON.stringify([
            { email: "friend1@test.com", username: "friend1", uid: "friend1" },
            { email: "friend2@test.com", username: "friend2", uid: "friend2" },
          ]),
        },
      });
    });
  });
});
