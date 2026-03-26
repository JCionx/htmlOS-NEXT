import { useState, useEffect } from "react";
import { EmptyView, Card, TextInput, Button } from "@htmlos-next/ui";
import { User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SettingEntry } from "../components/SettingEntry/SettingEntry";
import * as api from "@htmlos-next/api";

function UserView() {
  const { t } = useTranslation();

  const [user, setUser] = useState<{ id: number; username: string } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Username change
  const [newUsername, setNewUsername] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameSuccess, setUsernameSuccess] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const userData = await api.getCurrentUser();
        setUser(userData);
        setNewUsername(userData.username);
      } catch (err) {
        console.error("Failed to load user:", err);
        setError(
          err instanceof Error ? err.message : t("user.failedtoloaduser"),
        );
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleChangeUsername = async () => {
    setUsernameError(null);
    setUsernameSuccess(false);

    if (!newUsername || newUsername.trim().length === 0) {
      setUsernameError(t("user.newusernamerequired"));
      return;
    }

    if (newUsername === user?.username) {
      setUsernameError(t("user.newusernamecantbesame"));
      return;
    }

    try {
      await api.changeUsername(newUsername);
      setUsernameSuccess(true);
      setUser((prev) => (prev ? { ...prev, username: newUsername } : null));
      setTimeout(() => setUsernameSuccess(false), 3000);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : t("user.failedtochangeusername");
      setUsernameError(errorMsg);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError(t("user.currentpasswordrequired"));
      return;
    }

    if (!newPassword) {
      setPasswordError(t("user.newpasswordrequired"));
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(t("user.passwordtooshort"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t("user.passwordsdontmatch"));
      return;
    }

    try {
      await api.changePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : t("user.failedtochangepassword");
      setPasswordError(errorMsg);
    }
  };

  if (loading) {
    return <EmptyView icon={User} label={t("user.loading")} />;
  }

  if (error) {
    return <EmptyView icon={User} label={t("user.error")} />;
  }

  if (!user) {
    return <EmptyView icon={User} label={t("user.notfound")} />;
  }

  return (
    <>
      <SettingEntry>
        <p>{t("user.changeusername")}</p>
      </SettingEntry>

      <Card>
        <label htmlFor="newUsername">{t("user.newusername")}</label>
        <TextInput
          value={newUsername}
          onChange={setNewUsername}
          placeholder={t("user.enternewusername")}
        />
        {usernameError && <div>{usernameError}</div>}

        {usernameSuccess && <div>{t("user.usernamechanged")}</div>}

        <Button
          onClick={handleChangeUsername}
          disabled={!newUsername || newUsername === user.username}
        >
          {t("user.changeusername")}
        </Button>
      </Card>

      <SettingEntry>
        <p>{t("user.changepassword")}</p>
      </SettingEntry>

      <Card>
        <label htmlFor="currentPassword">{t("user.currentpassword")}</label>
        <TextInput
          type="password"
          value={currentPassword}
          onChange={setCurrentPassword}
          placeholder={t("user.entercurrentpassword")}
        />
        <label htmlFor="newPassword">{t("user.newpassword")}</label>
        <TextInput
          type="password"
          value={newPassword}
          onChange={setNewPassword}
          placeholder={t("user.enternewpassword")}
        />

        <label htmlFor="confirmPassword">{t("user.confirmpassword")}</label>
        <TextInput
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder={t("user.enternewpassword")}
        />
        {passwordError && <div>{passwordError}</div>}

        {passwordSuccess && <div>{t("user.passwordchanged")}</div>}

        <Button
          onClick={handleChangePassword}
          disabled={!currentPassword || !newPassword || !confirmPassword}
        >
          {t("user.changepassword")}
        </Button>
      </Card>
    </>
  );
}

export default UserView;
