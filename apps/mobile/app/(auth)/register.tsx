import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { Text, TextInput, Button, HelperText } from "react-native-paper";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../../src/hooks/useAuth";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in email and password");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setError(null);

    try {
      await register.mutateAsync({
        email: email.trim(),
        password,
        name: name.trim() || undefined,
      });
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Create Account
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Sign up to get started
        </Text>

        <View style={styles.form}>
          <TextInput
            label="Name (optional)"
            value={name}
            onChangeText={setName}
            mode="outlined"
            autoCapitalize="words"
            disabled={register.isPending}
            accessibilityLabel="Name"
          />

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            disabled={register.isPending}
            accessibilityLabel="Email address"
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            disabled={register.isPending}
            accessibilityLabel="Password"
          />

          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={register.isPending}
            disabled={register.isPending}
            style={styles.registerButton}
            accessibilityLabel="Create account"
          >
            {register.isPending ? "Creating account..." : "Create Account"}
          </Button>

          <View style={styles.loginLink}>
            <Text variant="bodyMedium">Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <Button mode="text" compact>
                Sign In
              </Button>
            </Link>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 32,
  },
  form: {
    gap: 12,
  },
  registerButton: {
    marginTop: 8,
  },
  loginLink: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
});
