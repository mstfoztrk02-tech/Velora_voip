import React, { useState } from "react";
import { Shield, Phone, Building2, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "../hooks/use-toast";

const VALID_CREDENTIALS = {
  bireysel: {
    code: "392393",
    password: "53328615458",
  },
  kurumsal: {
    code: "392393",
    password: "53328615458",
  },
};

const VoIPLogin = ({ onLoginSuccess }) => {
  const { toast } = useToast();
  const [loginType, setLoginType] = useState("bireysel");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    password: "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validCreds = VALID_CREDENTIALS[loginType];

      if (
        formData.code !== validCreds.code ||
        formData.password !== validCreds.password
      ) {
        throw new Error("Kullanıcı kodu veya şifre hatalı.");
      }

      const userData = {
        type: loginType,
        role: "user",
        verified: true,
        loginTime: Date.now(),
        permissions: getPermissions(loginType),
      };

      toast({
        title: "Başarılı",
        description: "Giriş yapıldı, yönlendiriliyorsunuz...",
      });

      setTimeout(() => {
        onLoginSuccess(userData);
      }, 500);
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPermissions = (type) => {
    const permissions = {
      bireysel: ["view_calls", "listen_recordings", "view_crm"],
      kurumsal: [
        "view_calls",
        "listen_recordings",
        "view_crm",
        "manage_users",
        "view_reports",
      ],
    };
    return permissions[type] || permissions.bireysel;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold">
            <Shield size={16} />
            A.I CALL AGENT
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-bold text-2xl inline-block mb-3">
              Velora
            </div>
            <h2 className="text-2xl font-bold text-gray-900">VoIP CRM Giriş</h2>
            <p className="text-sm text-gray-600 mt-1">
              Güvenli doğrulama ile giriş yapın
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLoginType("bireysel")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  loginType === "bireysel"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <Phone
                  className={`mx-auto mb-2 ${
                    loginType === "bireysel" ? "text-blue-600" : "text-gray-400"
                  }`}
                  size={32}
                />
                <div className="text-sm font-semibold">Bireysel</div>
              </button>
              <button
                onClick={() => setLoginType("kurumsal")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  loginType === "kurumsal"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <Building2
                  className={`mx-auto mb-2 ${
                    loginType === "kurumsal" ? "text-blue-600" : "text-gray-400"
                  }`}
                  size={32}
                />
                <div className="text-sm font-semibold">Kurumsal</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label>Kullanıcı Kodu</Label>
              <Input
                type="text"
                placeholder="Kullanıcı kodunu giriniz."
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Şifre</Label>
              <Input
                type="password"
                placeholder="Şifrenizi giriniz."
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600"
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
            <Button
              type="button"
              className="w-full bg-gradient-to-r from-red-500 to-red-600"
            >
              Hemen Üye Ol
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>🔒 Güvenli giriş sistemi</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoIPLogin;
