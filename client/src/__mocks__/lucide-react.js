// Mock for lucide-react icons
import React from "react";

// Create a mock component for each icon
const createMockIcon = (name) => {
  const MockIcon = (props) =>
    React.createElement("div", {
      "data-testid": `${name.toLowerCase()}-icon`,
      ...props,
    });
  MockIcon.displayName = name;
  return MockIcon;
};

export const Star = createMockIcon("Star");
export const Plus = createMockIcon("Plus");
export const Minus = createMockIcon("Minus");
export const Trash2 = createMockIcon("Trash2");
export const ShoppingCart = createMockIcon("ShoppingCart");
export const Search = createMockIcon("Search");
export const Filter = createMockIcon("Filter");
export const Heart = createMockIcon("Heart");
export const User = createMockIcon("User");
export const Menu = createMockIcon("Menu");
export const X = createMockIcon("X");
export const ChevronDown = createMockIcon("ChevronDown");
export const ChevronUp = createMockIcon("ChevronUp");
export const Check = createMockIcon("Check");
export const Eye = createMockIcon("Eye");
export const EyeOff = createMockIcon("EyeOff");
export const Edit = createMockIcon("Edit");
export const Package = createMockIcon("Package");
export const CreditCard = createMockIcon("CreditCard");
export const Loader2 = createMockIcon("Loader2");
export const Upload = createMockIcon("Upload");
export const Delete = createMockIcon("Delete");
export const Save = createMockIcon("Save");
export const Cancel = createMockIcon("Cancel");
export const Home = createMockIcon("Home");
export const Settings = createMockIcon("Settings");
export const LogOut = createMockIcon("LogOut");
export const MapPin = createMockIcon("MapPin");
export const Phone = createMockIcon("Phone");
export const Mail = createMockIcon("Mail");
export const Calendar = createMockIcon("Calendar");
export const Clock = createMockIcon("Clock");
export const AlertCircle = createMockIcon("AlertCircle");
export const CheckCircle = createMockIcon("CheckCircle");
export const XCircle = createMockIcon("XCircle");
export const Info = createMockIcon("Info");

// Default export
export default {
  Star,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Search,
  Filter,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Check,
  Eye,
  EyeOff,
  Edit,
  Package,
  CreditCard,
  Loader2,
  Upload,
  Delete,
  Save,
  Cancel,
  Home,
  Settings,
  LogOut,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
};
