import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import "@testing-library/jest-native/extend-expect";
import Signup from "../../app/(auth)/signup";
import { Alert } from "react-native";
import { FIREBASE_AUTH } from "../../firebaseConfig";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { getDatabase, ref, get, child } from "firebase/database";

// Mock Firebase methods
jest.mock("firebase/auth");
jest.mock("firebase/database");

// Mock the Alert.alert function
jest.spyOn(Alert, "alert");

describe("Signup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows error alert for invalid email", async () => {
    (createUserWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({
      code: "auth/invalid-email",
    });

    const { getByPlaceholderText, getByText } = render(<Signup />);
    const emailInput = getByPlaceholderText("Email");
    const passwordInput = getByPlaceholderText("Password");
    const usernameInput = getByPlaceholderText("Username");
    const signUpButton = getByText("Sign Up");

    // Fill in the forms with invalid email
    fireEvent.changeText(emailInput, "invalid-email");
    fireEvent.changeText(passwordInput, "validpassword123");
    fireEvent.changeText(usernameInput, "validusername");

    fireEvent.press(signUpButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Invalid email address");
    });
  });

  it("shows error alert for duplicate username", async () => {
    const snapshot = {
      exists: jest.fn().mockReturnValue(true),
    };

    (get as jest.Mock).mockResolvedValueOnce(snapshot);

    const { getByPlaceholderText, getByText } = render(<Signup />);
    const emailInput = getByPlaceholderText("Email");
    const passwordInput = getByPlaceholderText("Password");
    const usernameInput = getByPlaceholderText("Username");
    const signUpButton = getByText("Sign Up");

    // Fill in the forms
    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "validpassword123");
    fireEvent.changeText(usernameInput, "duplicateusername");

    fireEvent.press(signUpButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Username already taken");
    });
  });
});
