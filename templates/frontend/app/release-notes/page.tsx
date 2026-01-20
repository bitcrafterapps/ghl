"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/Layout";
import { SubHeader } from "@/components/SubHeader";
import { FileText } from "lucide-react";
import { getApiUrl } from "@/lib/api";

export default function ReleaseNotesPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      // Fetch user profile to check authentication
      const apiUrl = getApiUrl();
      fetch(`${apiUrl}/api/v1/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to authenticate");
          return res.json();
        })
        .then((data) => {
          setUserProfile(data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error:", error);
          router.push("/login");
        });
    } else {
      router.push("/login");
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#1C1C1C]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#205ab2]"></div>
      </div>
    );
  }

  return (
    <Layout isAuthenticated={isAuthenticated} noPadding>
      <SubHeader 
        icon={FileText}
        title="Release Notes"
        subtitle="View platform release notes and version history"
      />

      <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Release Notes Content */}
          <div className="bg-white dark:bg-[#25262b] rounded-lg p-6 border border-gray-200 dark:border-[#2e2f33]">
            <div className="space-y-10">
              {/* Current Version */}
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  Current Version: 1.00.00
                </h2>

                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200 mt-4">Initial Release</h3>
                <div className="flex flex-col space-y-1 mb-4">
                  <div className="flex items-start">
                    <div className="w-1.5 h-1.5 rounded-full accent-bg mt-1.5 mr-2 flex-shrink-0"></div>
                    <span className="text-gray-800 dark:text-white">
                      Initial platform release with secure user authentication system
                    </span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-1.5 h-1.5 rounded-full accent-bg mt-1.5 mr-2 flex-shrink-0"></div>
                    <span className="text-gray-800 dark:text-white">
                      Responsive dashboard with dark/light mode support
                    </span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-1.5 h-1.5 rounded-full accent-bg mt-1.5 mr-2 flex-shrink-0"></div>
                    <span className="text-gray-800 dark:text-white">
                      Core API functionality for data management and retrieval
                    </span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-1.5 h-1.5 rounded-full accent-bg mt-1.5 mr-2 flex-shrink-0"></div>
                    <span className="text-gray-800 dark:text-white">
                      User profile management with customizable settings
                    </span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-1.5 h-1.5 rounded-full accent-bg mt-1.5 mr-2 flex-shrink-0"></div>
                    <span className="text-gray-800 dark:text-white">
                      Basic reporting and analytics features
                    </span>
                  </div>
                </div>
              </div>

              {/* Divider between Current and Previous Versions */}
              <hr className="border-t border-gray-200 dark:border-[#3A3A3A]" />

              {/* Previous Versions */}
              <div>
                <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                     Previous Versions
                    </h3>
                </div>

                <p className="text-gray-500 dark:text-gray-400 italic">No previous versions.</p>

              </div>
            </div>
          </div>
        </div>
    </Layout>
  );
}
