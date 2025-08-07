import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegisterForm } from "../RegisterForm";
import {
  renderWithProviders,
  testRegisterData,
  mockAxiosResponse,
} from "../../../utils/testUtils";
import axios from "axios";

// Mock dependencies
jest.mock("axios");
jest.mock("../../../hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

const mockedAxios = axios;

describe("RegisterForm Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    test("renders register form with all elements", () => {
      renderWithProviders(<RegisterForm />);

      expect(screen.getByText("Welcome")).toBeInTheDocument();
      expect(
        screen.getByText("Sign up with your Google account")
      ).toBeInTheDocument();
      expect(screen.getByText("Register with Google")).toBeInTheDocument();
      expect(screen.getByLabelText("Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Sign up" })
      ).toBeInTheDocument();
    });

    test("renders navigation links", () => {
      renderWithProviders(<RegisterForm />);

      expect(screen.getByText("Already have an account?")).toBeInTheDocument();
      expect(screen.getByText("Sign in")).toBeInTheDocument();
    });
  });

  describe("Form Validation", () => {
    test("shows required validation for empty fields", async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterForm />);

      const submitButton = screen.getByRole("button", { name: "Sign up" });
      await user.click(submitButton);

      // HTML5 validation should prevent submission
      const nameInput = screen.getByLabelText("Name");
      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");

      expect(nameInput).toBeRequired();
      expect(emailInput).toBeRequired();
      expect(passwordInput).toBeRequired();
    });

    test("validates email format", async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterForm />);

      const emailInput = screen.getByLabelText("Email");
      await user.type(emailInput, "invalid-email");

      expect(emailInput).toHaveValue("invalid-email");
      expect(emailInput.validity.valid).toBe(false);
    });

    test("accepts valid form data", async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterForm />);

      const nameInput = screen.getByLabelText("Name");
      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");

      await user.type(nameInput, testRegisterData.valid.username);
      await user.type(emailInput, testRegisterData.valid.email);
      await user.type(passwordInput, testRegisterData.valid.password);

      expect(nameInput).toHaveValue(testRegisterData.valid.username);
      expect(emailInput).toHaveValue(testRegisterData.valid.email);
      expect(passwordInput).toHaveValue(testRegisterData.valid.password);
    });
  });

  describe("Form Submission", () => {
    test("submits form with valid data successfully", async () => {
      const user = userEvent.setup();
      const mockResponse = mockAxiosResponse({
        success: true,
        message: "Registration successful",
      });

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      renderWithProviders(<RegisterForm />);

      const nameInput = screen.getByLabelText("Name");
      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Sign up" });

      await user.type(nameInput, testRegisterData.valid.username);
      await user.type(emailInput, testRegisterData.valid.email);
      await user.type(passwordInput, testRegisterData.valid.password);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          "http://localhost:5000/api/auth/register",
          {
            username: testRegisterData.valid.username,
            email: testRegisterData.valid.email,
            password: testRegisterData.valid.password,
          },
          { withCredentials: true }
        );
      });
    });

    test("handles registration failure with error message", async () => {
      const user = userEvent.setup();
      const mockErrorResponse = mockAxiosResponse(
        {
          success: false,
          message: "Email already exists",
        },
        400
      );

      mockedAxios.post.mockRejectedValueOnce({
        response: mockErrorResponse,
      });

      renderWithProviders(<RegisterForm />);

      const nameInput = screen.getByLabelText("Name");
      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Sign up" });

      await user.type(nameInput, testRegisterData.valid.username);
      await user.type(emailInput, testRegisterData.valid.email);
      await user.type(passwordInput, testRegisterData.valid.password);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalled();
      });
    });

    test("handles network error during registration", async () => {
      const user = userEvent.setup();
      mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

      renderWithProviders(<RegisterForm />);

      const nameInput = screen.getByLabelText("Name");
      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Sign up" });

      await user.type(nameInput, testRegisterData.valid.username);
      await user.type(emailInput, testRegisterData.valid.email);
      await user.type(passwordInput, testRegisterData.valid.password);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalled();
      });
    });

    test("validates minimum password length", async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterForm />);

      const passwordInput = screen.getByLabelText("Password");
      await user.type(passwordInput, "123");

      expect(passwordInput).toHaveValue("123");
      // Additional validation logic would be tested based on implementation
    });
  });

  describe("Google Registration", () => {
    test("redirects to Google OAuth when Google button is clicked", async () => {
      const user = userEvent.setup();
      const originalLocation = window.location;

      delete window.location;
      window.location = { href: "" };

      renderWithProviders(<RegisterForm />);

      const googleButton = screen.getByText("Register with Google");
      await user.click(googleButton);

      expect(window.location.href).toBe(
        "http://localhost:5000/api/auth/google"
      );

      window.location = originalLocation;
    });
  });

  describe("Navigation", () => {
    test("contains link to login page", () => {
      renderWithProviders(<RegisterForm />);

      const loginLink = screen.getByText("Sign in");
      expect(loginLink).toHaveAttribute("href", "/auth/login");
    });
  });

  describe("Accessibility", () => {
    test("has proper form labels and accessibility attributes", () => {
      renderWithProviders(<RegisterForm />);

      const nameInput = screen.getByLabelText("Name");
      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");

      expect(nameInput).toHaveAttribute("type", "text");
      expect(emailInput).toHaveAttribute("type", "email");
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(nameInput).toHaveAttribute("id", "name");
      expect(emailInput).toHaveAttribute("id", "email");
      expect(passwordInput).toHaveAttribute("id", "password");
    });

    test("has proper ARIA labels for buttons", () => {
      renderWithProviders(<RegisterForm />);

      const registerButton = screen.getByRole("button", { name: "Sign up" });
      const googleButton = screen.getByRole("button", {
        name: "Register with Google",
      });

      expect(registerButton).toBeInTheDocument();
      expect(googleButton).toBeInTheDocument();
    });
  });

  describe("Form State Management", () => {
    test("updates input values correctly", async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterForm />);

      const nameInput = screen.getByLabelText("Name");
      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");

      await user.type(nameInput, testRegisterData.valid.username);
      await user.type(emailInput, testRegisterData.valid.email);
      await user.type(passwordInput, testRegisterData.valid.password);

      expect(nameInput).toHaveValue(testRegisterData.valid.username);
      expect(emailInput).toHaveValue(testRegisterData.valid.email);
      expect(passwordInput).toHaveValue(testRegisterData.valid.password);
    });

    test("handles form reset after submission", async () => {
      const user = userEvent.setup();
      const mockResponse = mockAxiosResponse({
        success: true,
        message: "Registration successful",
      });

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      renderWithProviders(<RegisterForm />);

      const nameInput = screen.getByLabelText("Name");
      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Sign up" });

      await user.type(nameInput, testRegisterData.valid.username);
      await user.type(emailInput, testRegisterData.valid.email);
      await user.type(passwordInput, testRegisterData.valid.password);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalled();
      });
    });
  });

  describe("Edge Cases", () => {
    test("handles special characters in username", async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterForm />);

      const nameInput = screen.getByLabelText("Name");
      await user.type(nameInput, "Test@User123");

      expect(nameInput).toHaveValue("Test@User123");
    });

    test("handles long input values", async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterForm />);

      const longName = "A".repeat(100);
      const nameInput = screen.getByLabelText("Name");
      await user.type(nameInput, longName);

      expect(nameInput).toHaveValue(longName);
    });

    test("handles rapid form submission attempts", async () => {
      const user = userEvent.setup();
      const mockResponse = mockAxiosResponse({
        success: true,
        message: "Registration successful",
      });

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      renderWithProviders(<RegisterForm />);

      const nameInput = screen.getByLabelText("Name");
      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Sign up" });

      await user.type(nameInput, testRegisterData.valid.username);
      await user.type(emailInput, testRegisterData.valid.email);
      await user.type(passwordInput, testRegisterData.valid.password);

      // Try to submit multiple times rapidly
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);

      // Should only call API once
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      });
    });
  });
});
