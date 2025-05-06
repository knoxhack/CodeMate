import React from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const [location] = useLocation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
      <div className="text-9xl font-bold text-amber-500 mb-4">404</div>
      <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
      <p className="text-gray-400 mb-6 text-center">
        We couldn't find the page you were looking for: <span className="text-amber-400">{location}</span>
      </p>
      <Button asChild className="bg-amber-600 hover:bg-amber-700">
        <Link href="/">Return to Home</Link>
      </Button>
    </div>
  );
}