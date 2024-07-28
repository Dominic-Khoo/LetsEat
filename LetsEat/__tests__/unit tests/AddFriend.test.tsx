import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import UserList from "../../app/(tabs)/social/components/AddFriendScreen"; // adjust the import path as needed
import { getAuth } from "firebase/auth";
import { ref, onValue, get, child, push, set } from "firebase/database";
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
const mockChild = child as jest.Mock;
const mockPush = push as jest.Mock;
const mockSet = set as jest.Mock;

const mockRouterPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({
  push: mockRouterPush,
  back: jest.fn(),
});

describe("UserList", () => {
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
            friend1: {
              uid: "friend1",
              email: "friend1@test.com",
              username: "friend1",
            },
          }),
        });
      }
    });

    mockGet.mockImplementation((ref: string) => {
      if (ref === "users") {
        return Promise.resolve({
          exists: () => true,
          val: () => ({
            user2: { uid: "user2", email: "user2@test.com", username: "user2" },
            user3: { uid: "user3", email: "user3@test.com", username: "user3" },
          }),
        });
      } else if (ref === "users/currentUserId") {
        return Promise.resolve({
          exists: () => true,
          val: () => ({ username: "currentUser" }),
        });
      }
    });

    mockPush.mockReturnValue("newRequestRef");
    mockSet.mockResolvedValue(true);
  });

  test("renders UserList component", () => {
    const { getByPlaceholderText } = render(<UserList />);
    expect(getByPlaceholderText("Search Users...")).toBeTruthy();
  });

  test("searches for users and displays results", async () => {
    const { getByPlaceholderText, getByText } = render(<UserList />);
    const searchInput = getByPlaceholderText("Search Users...");

    fireEvent.changeText(searchInput, "user2");
    fireEvent.press(getByText("Search"));

    await waitFor(() => {
      expect(getByText("user2")).toBeTruthy();
    });
  });

  test("selects a user and displays action buttons", async () => {
    const { getByPlaceholderText, getByText } = render(<UserList />);
    const searchInput = getByPlaceholderText("Search Users...");

    fireEvent.changeText(searchInput, "user2");
    fireEvent.press(getByText("Search"));

    await waitFor(() => {
      const userItem = getByText("user2");
      expect(userItem).toBeTruthy();
      fireEvent.press(userItem);
    });

    await waitFor(() => {
      expect(getByText("View Profile")).toBeTruthy();
      expect(getByText("Send Friend Request")).toBeTruthy();
    });
  });

  test("sends a friend request", async () => {
    const { getByPlaceholderText, getByText } = render(<UserList />);
    const searchInput = getByPlaceholderText("Search Users...");

    fireEvent.changeText(searchInput, "user2");
    fireEvent.press(getByText("Search"));

    await waitFor(() => {
      const userItem = getByText("user2");
      expect(userItem).toBeTruthy();
      fireEvent.press(userItem);
    });

    await waitFor(() => {
      const sendRequestButton = getByText("Send Friend Request");
      expect(sendRequestButton).toBeTruthy();
      fireEvent.press(sendRequestButton);
    });

    await waitFor(() => {
      expect(getByText("Request sent successfully")).toBeTruthy();
    });
  });
});
