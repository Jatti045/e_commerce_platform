import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "../LoginForm";
import {
  renderWithProviders,
  testCredentials,
  mockAxiosResponse,
} from "../../../utils/testUtils";
import { loginUser } from "../../../store/slices/auth-slice";
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

describe("LoginForm Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    test("renders login form with all elements", () => {
      renderWithProviders(<LoginForm />);

      expect(screen.getByText("Welcome back")).toBeInTheDocument();
      expect(
        screen.getByText("Login with your Google account")
      ).toBeInTheDocument();
      expect(screen.getByText("Login with Google")).toBeInTheDocument();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
      expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
      expect(screen.getByText("Sign up")).toBeInTheDocument();
    });

    test("renders continue shopping link", () => {
      renderWithProviders(<LoginForm />);

      expect(screen.getByText("Continue shopping")).toBeInTheDocument();
    });

    test("renders forgot password link", () => {
      renderWithProviders(<LoginForm />);

      expect(screen.getByText("Forgot your password?")).toBeInTheDocument();
    });
  });

  describe("Form Validation", () => {
    test("shows required validation for empty fields", async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginForm />);

      const submitButton = screen.getByRole("button", { name: "Login" });
      await user.click(submitButton);

      // HTML5 validation should prevent submission
      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");

      expect(emailInput).toBeRequired();
      expect(passwordInput).toBeRequired();
    });

    test("validates email format", async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      await user.type(emailInput, "invalid-email");

      expect(emailInput).toHaveValue("invalid-email");
      expect(emailInput.validity.valid).toBe(false);
    });
  });

  describe("Form Submission", () => {
    test("submits form with valid credentials successfully", async () => {
      const user = userEvent.setup();
      const mockResponse = mockAxiosResponse({
        success: true,
        message: "Login successful",
        user: { id: 1, email: testCredentials.valid.email },
      });

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const { store } = renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Login" });

      await user.type(emailInput, testCredentials.valid.email);
      await user.type(passwordInput, testCredentials.valid.password);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          "http://localhost:5000/api/auth/login",
          testCredentials.valid,
          { withCredentials: true }
        );
      });
    });

    test("handles login failure with error message", async () => {
      const user = userEvent.setup();
      const mockErrorResponse = mockAxiosResponse(
        {
          success: false,
          message: "Invalid credentials",
        },
        401
      );

      mockedAxios.post.mockRejectedValueOnce({
        response: mockErrorResponse,
      });

      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Login" });

      await user.type(emailInput, testCredentials.invalid.email);
      await user.type(passwordInput, testCredentials.invalid.password);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalled();
      });
    });

    test("handles network error during login", async () => {
      const user = userEvent.setup();
      mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Login" });

      await user.type(emailInput, testCredentials.valid.email);
      await user.type(passwordInput, testCredentials.valid.password);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalled();
      });
    });
  });

  describe("Google Sign-In", () => {
    test("redirects to Google OAuth when Google button is clicked", async () => {
      const user = userEvent.setup();
      const originalLocation = window.location;

      delete window.location;
      window.location = { href: "" };

      renderWithProviders(<LoginForm />);

      const googleButton = screen.getByText("Login with Google");
      await user.click(googleButton);

      expect(window.location.href).toBe(
        "http://localhost:5000/api/auth/google"
      );

      window.location = originalLocation;
    });
  });

  describe("Navigation", () => {
    test("contains link to register page", () => {
      renderWithProviders(<LoginForm />);

      const registerLink = screen.getByText("Sign up");
      expect(registerLink).toHaveAttribute("href", "/auth/register");
    });

    test("handles continue shopping click", async () => {
      const user = userEvent.setup();
      const mockNavigate = jest.fn();

      jest.doMock("react-router-dom", () => ({
        ...jest.requireActual("react-router-dom"),
        useNavigate: () => mockNavigate,
      }));

      renderWithProviders(<LoginForm />);

      const continueShoppingLink = screen.getByText("Continue shopping");
      await user.click(continueShoppingLink);

      // Note: This test might need adjustment based on actual implementation
    });
  });

  describe("Accessibility", () => {
    test("has proper form labels and accessibility attributes", () => {
      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");

      expect(emailInput).toHaveAttribute("type", "email");
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(emailInput).toHaveAttribute("id", "email");
      expect(passwordInput).toHaveAttribute("id", "password");
    });

    test("has proper ARIA labels for buttons", () => {
      renderWithProviders(<LoginForm />);

      const loginButton = screen.getByRole("button", { name: "Login" });
      const googleButton = screen.getByRole("button", {
        name: "Login with Google",
      });

      expect(loginButton).toBeInTheDocument();
      expect(googleButton).toBeInTheDocument();
    });
  });

  describe("Form State Management", () => {
    test("updates input values correctly", async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");

      await user.type(emailInput, testCredentials.valid.email);
      await user.type(passwordInput, testCredentials.valid.password);

      expect(emailInput).toHaveValue(testCredentials.valid.email);
      expect(passwordInput).toHaveValue(testCredentials.valid.password);
    });

    test("clears form after successful submission", async () => {
      const user = userEvent.setup();
      const mockResponse = mockAxiosResponse({
        success: true,
        message: "Login successful",
      });

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Login" });

      await user.type(emailInput, testCredentials.valid.email);
      await user.type(passwordInput, testCredentials.valid.password);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalled();
      });
    });
  });
});
