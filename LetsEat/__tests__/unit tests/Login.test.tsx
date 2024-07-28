// __tests__/unit-tests/Login.test.tsx
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import "@testing-library/jest-native/extend-expect";
import Login from "../../app/(auth)/login";
import { FIREBASE_AUTH } from "../../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { router } from "expo-router";
import { Alert } from "react-native";

// Mock Firebase methods
jest.mock("firebase/auth");
jest.mock("expo-router");

// Mock the Alert.alert function
jest.spyOn(Alert, "alert");

describe("Login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("allows users to log in with valid email and password", async () => {
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
      user: { uid: "123" },
    });
    (router.push as jest.Mock).mockImplementationOnce(() => {});

    const { getByPlaceholderText, getByText } = render(<Login />);
    const emailInput = getByPlaceholderText("Email");
    const passwordInput = getByPlaceholderText("Password");
    const loginButton = getByText("Login");

    // Fill in the forms with valid credentials
    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "validpassword123");

    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        FIREBASE_AUTH,
        "test@example.com",
        "validpassword123"
      );
      expect(router.push).toHaveBeenCalledWith("/home");
    });
  });

  it("shows error alert if fields are not filled", async () => {
    const { getByText } = render(<Login />);
    const loginButton = getByText("Login");

    // Press the login button without filling the forms
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "Please fill all fields"
      );
    });
  });

  it("shows error alert for incorrect password", async () => {
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({
      code: "auth/wrong-password",
    });

    const { getByPlaceholderText, getByText } = render(<Login />);
    const emailInput = getByPlaceholderText("Email");
    const passwordInput = getByPlaceholderText("Password");
    const loginButton = getByText("Login");

    // Fill in the forms with valid email but incorrect password
    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "wrongpassword");

    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Incorrect password");
    });
  });

  it("shows error alert if user not found", async () => {
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({
      code: "auth/user-not-found",
    });

    const { getByPlaceholderText, getByText } = render(<Login />);
    const emailInput = getByPlaceholderText("Email");
    const passwordInput = getByPlaceholderText("Password");
    const loginButton = getByText("Login");

    // Fill in the forms with email that doesn't exist
    fireEvent.changeText(emailInput, "notfound@example.com");
    fireEvent.changeText(passwordInput, "validpassword123");

    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("User not found");
    });
  });
});
