"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { countries, getUniversalLink } from "@selfxyz/core";
import { SelfQRcodeWrapper, SelfAppBuilder, type SelfApp } from "@selfxyz/qrcode";
import { ethers } from "ethers";

interface QRVerificationProps {
  userId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onToastMessage?: (message: string) => void;
}

export const QRVerification = ({
  userId,
  onSuccess,
  onError,
  onToastMessage,
}: QRVerificationProps) => {
  const router = useRouter();
  const [linkCopied, setLinkCopied] = useState(false);
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
  const [universalLink, setUniversalLink] = useState("");

  // Initialize Self app when userId changes
  useEffect(() => {
    console.log("QRVerification - userId:", userId);
    try {
      const app = new SelfAppBuilder({
        version: 2,
        appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || "Self Workshop",
        scope: process.env.NEXT_PUBLIC_SELF_SCOPE || "self-workshop",
        endpoint: `${process.env.NEXT_PUBLIC_SELF_ENDPOINT}`,
        logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
        userId: userId,
        endpointType: "staging_celo",
        userIdType: "hex",
        userDefinedData: "Bonjour Cannes!",
        disclosures: {
          minimumAge: 18,
          ofac: true,
          excludedCountries: [
            countries.UNITED_STATES,
            countries.TURKEY,
            countries.CHINA,
            countries.NORTH_KOREA,
            countries.SOUTH_KOREA,
            countries.JAPAN,
            countries.PAKISTAN,
            countries.EGYPT,
          ],
          nationality: false,
          date_of_birth: true,
          passport_number: true,
          expiry_date: true,
        },
      }).build();

      setSelfApp(app);
      setUniversalLink(getUniversalLink(app));
    } catch (error) {
      console.error("Failed to initialize Self app:", error);
      onError?.("Failed to initialize verification");
    }
  }, [userId, onError]);

  const copyToClipboard = () => {
    if (!universalLink) return;

    navigator.clipboard
      .writeText(universalLink)
      .then(() => {
        setLinkCopied(true);
        onToastMessage?.("Universal link copied to clipboard!");
        setTimeout(() => setLinkCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        onToastMessage?.("Failed to copy link");
      });
  };

  const openSelfApp = () => {
    if (!universalLink) return;

    window.open(universalLink, "_blank");
    onToastMessage?.("Opening Self App...");
  };

  const handleSuccessfulVerification = () => {
    onToastMessage?.("Verification successful! Redirecting...");
    setTimeout(() => {
      router.push("/verified");
    }, 1500);
    onSuccess?.();
  };

  const handleVerificationError = () => {
    onToastMessage?.("Error: Failed to verify identity");
    onError?.("Failed to verify identity");
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 w-full max-w-xs sm:max-w-sm md:max-w-md">
      <div className="flex justify-center mb-4 sm:mb-6">
        {selfApp ? (
          <SelfQRcodeWrapper
            selfApp={selfApp}
            onSuccess={handleSuccessfulVerification}
            onError={handleVerificationError}
          />
        ) : (
          <div className="w-[256px] h-[256px] bg-gray-200 animate-pulse flex items-center justify-center">
            <p className="text-gray-500 text-sm">Loading QR Code...</p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 mb-4 sm:mb-6">
        <button
          type="button"
          onClick={copyToClipboard}
          disabled={!universalLink}
          className="flex-1 bg-gray-800 hover:bg-gray-700 transition-colors text-white p-2 rounded-md text-sm sm:text-base disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {linkCopied ? "Copied!" : "Copy Universal Link"}
        </button>

        <button
          type="button"
          onClick={openSelfApp}
          disabled={!universalLink}
          className="flex-1 bg-blue-600 hover:bg-blue-500 transition-colors text-white p-2 rounded-md text-sm sm:text-base mt-2 sm:mt-0 disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          Open Self App
        </button>
      </div>

      <div className="flex flex-col items-center gap-2 mt-2">
        <span className="text-gray-500 text-xs uppercase tracking-wide">User Address</span>
        <div className="bg-gray-100 rounded-md px-3 py-2 w-full text-center break-all text-sm font-mono text-gray-800 border border-gray-200">
          {userId ? userId : <span className="text-gray-400">Not connected</span>}
        </div>
      </div>
    </div>
  );
};
