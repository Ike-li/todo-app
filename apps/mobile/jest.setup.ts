import "@testing-library/react-native/extend-expect";

// Mock expo-secure-store
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: jest.fn(() => ({})),
  Link: ({ children }: any) => children,
  Stack: {
    Screen: () => null,
  },
  Tabs: {
    Screen: () => null,
  },
  Redirect: () => null,
}));

// Mock react-native-paper
jest.mock("react-native-paper", () => {
  const React = require("react");
  const { View, Text, TextInput, Pressable, ActivityIndicator } = require("react-native");

  return {
    PaperProvider: ({ children }: any) => children,
    Button: ({ children, onPress, disabled, loading, ...props }: any) =>
      React.createElement(
        Pressable,
        { onPress: disabled ? undefined : onPress, testID: props.testID, accessibilityState: { disabled } },
        loading ? React.createElement(ActivityIndicator, null) : null,
        React.createElement(Text, null, children)
      ),
    TextInput: Object.assign(
      React.forwardRef(({ label, onChangeText, error, ...props }: any, ref: any) =>
        React.createElement(View, { ...props },
          label ? React.createElement(Text, null, label) : null,
          React.createElement(TextInput, {
            ref,
            onChangeText,
            ...props,
          }),
          error ? React.createElement(Text, { testID: "error-text" }, error) : null,
        )
      ),
      {
        Icon: ({ icon }: any) => React.createElement(Text, null, icon),
      }
    ),
    Checkbox: ({ status, onPress, ...props }: any) =>
      React.createElement(Pressable, { onPress, testID: props.testID },
        React.createElement(Text, null, status === "checked" ? "checked" : "unchecked")
      ),
    List: {
      Item: ({ title, description, onPress, left, right, ...props }: any) => {
        const titleContent = typeof title === 'function' ? title() : title;
        const descContent = typeof description === 'function' ? description() : description;
        return React.createElement(Pressable, { onPress, testID: props.testID },
          left ? left({}) : null,
          React.createElement(View, null,
            titleContent,
            descContent ? (typeof descContent === 'string' ? React.createElement(Text, null, descContent) : descContent) : null,
          ),
          right ? right({}) : null,
        );
      },
      Icon: ({ icon }: any) => React.createElement(Text, null, icon),
    },
    FAB: ({ icon, onPress, label, ...props }: any) =>
      React.createElement(Pressable, { onPress, testID: props.testID },
        React.createElement(Text, null, label || icon)
      ),
    Appbar: {
      Header: ({ children }: any) => React.createElement(View, null, children),
      Content: ({ title }: any) => React.createElement(Text, null, title),
      BackAction: ({ onPress }: any) => React.createElement(Pressable, { onPress, testID: "back-button" }, React.createElement(Text, null, "back")),
      Action: ({ icon, onPress }: any) => React.createElement(Pressable, { onPress }, React.createElement(Text, null, icon)),
    },
    Card: ({ children, ...props }: any) => React.createElement(View, props, children),
    CardContent: ({ children }: any) => React.createElement(View, null, children),
    Text: ({ children, ...props }: any) => React.createElement(Text, props, children),
    ActivityIndicator: (props: any) => React.createElement(ActivityIndicator, props),
    HelperText: ({ children, type, visible }: any) =>
      visible ? React.createElement(Text, { testID: "helper-text" }, children) : null,
    Chip: ({ children, selected, onPress, onClose, disabled, style, ...props }: any) =>
      React.createElement(Pressable, { onPress: disabled ? undefined : onPress },
        React.createElement(Text, null, typeof children === "string" ? children : null),
        onClose ? React.createElement(Pressable, { onPress: onClose, testID: "chip-close" }, React.createElement(Text, null, "close")) : null,
      ),
    Badge: ({ children, style, ...props }: any) =>
      React.createElement(Text, { ...props }, children),
    IconButton: ({ icon, onPress, disabled, ...props }: any) =>
      React.createElement(Pressable, { onPress: disabled ? undefined : onPress, testID: props.testID },
        React.createElement(Text, null, icon),
      ),
    Menu: ({ children, visible, anchor }: any) =>
      React.createElement(View, null,
        anchor || null,
        visible ? children : null,
      ),
    'Menu.Item': ({ title, onPress, disabled }: any) =>
      React.createElement(Pressable, { onPress: disabled ? undefined : onPress },
        React.createElement(Text, null, title),
      ),
    Divider: () => React.createElement(View, null),
    useTheme: () => ({
      colors: {
        primary: "#6200ee",
        error: "#b00020",
        surface: "#ffffff",
        onSurface: "#000000",
        onSurfaceVariant: "#666666",
      },
    }),
  };
});
