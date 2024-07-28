// __tests__/unit-tests/Daily.test.tsx
import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import "@testing-library/jest-native/extend-expect";
import Daily from "../../app/(tabs)/home/components/Daily";
import { getAuth } from "firebase/auth";
import { ref, onValue } from "firebase/database";
import { FIREBASE_DB } from "../../firebaseConfig";

// Mock Firebase methods
jest.mock("firebase/auth");
jest.mock("firebase/database");

// Mock Firebase Database
const mockEvents = {
  event1: {
    id: "event1",
    day: new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Singapore",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }),
    name: "Lunch with Alice",
    height: 100,
    icon: "eat.png",
    type: "Open Jio",
    time: "12:00 PM",
    uid: "uid1",
    sender: "sender1",
    confirmedByUser: false,
    confirmedByPartner: false,
  },
  event2: {
    id: "event2",
    day: new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Singapore",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }),
    name: "Dinner with Bob",
    height: 100,
    icon: "reserved.png",
    type: "Booking",
    time: "06:00 PM",
    uid: "uid2",
    sender: "sender2",
    confirmedByUser: false,
    confirmedByPartner: false,
  },
};

// Mock current user
const mockCurrentUser = {
  uid: "mockUserId",
};

// Mock the Firebase Authentication
(getAuth as jest.Mock).mockReturnValue({
  currentUser: mockCurrentUser,
});

// Mock the Firebase Database
(ref as jest.Mock).mockReturnValue({
  on: jest.fn((eventType, callback) => callback({ val: () => mockEvents })),
  off: jest.fn(),
});

describe("Daily", () => {
  it("displays the schedule of the day", async () => {
    const { getByText } = render(<Daily />);

    // Wait for the events to be loaded
    await waitFor(() => {
      expect(getByText("Lunch with Alice")).toBeTruthy();
      expect(getByText("Dinner with Bob")).toBeTruthy();
      expect(getByText("with Alice")).toBeTruthy();
      expect(getByText("with Bob at 06:00 PM")).toBeTruthy();
    });
  });
});
