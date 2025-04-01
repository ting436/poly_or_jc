'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from "next-auth/react";

export default function RecommendationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter()
  const [rawRecommendations, setRawRecommendations] = useState(null)
  const [parsedData, setParsedData] = useState(null)
  const [loading, setLoading] = useState(true)

  interface ParsedRecommendations {
    intro: string;
    recommendations: string[];
    conclusion: string;
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in"); // Redirect to sign-in if not authenticated
    }
  }, [status, router]);
  
  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      const email = session.user.email
      const recommendations = localStorage.getItem(`recommendations${email}`)
      if (!recommendations) {
        // No recent form submission
        router.push('/dashboard/')
      } else {
        setRawRecommendations(recommendations)
        console.log("Recommendations loaded from local storage:", recommendations)
        // Parse the recommendations when they're loaded
        const parsed = parseRecommendations(recommendations)
        setParsedData(parsed)
        setLoading(false)
      }
    }
  }, [session, status, router])

  const parseRecommendations = (text: string): ParsedRecommendations => {
    // Split based on the recommendation titles
    const sections = text.split(/(\*\*Recommendation \d+: .*?\*\*)/);

    // The first section is the introduction
    const intro = formatMarkdown(sections[0].trim());
    
    // Extract recommendations
    const recommendations: string[] = [];
    for (let i = 1; i < sections.length - 1; i += 2) {
        const recTitle = sections[i].trim();
        const recBody = formatMarkdown(sections[i + 1].trim());
        recommendations.push(`${recTitle}\n\n${recBody}`);
    }
    
    // Extract concluding sentence if present
    let conclusion = "";
    if (recommendations.length > 0 && recommendations[recommendations.length - 1].includes("Concluding Sentence:")) {
        const recParts = recommendations[recommendations.length - 1].split("Concluding Sentence:");
        recommendations[recommendations.length - 1] = formatMarkdown(recParts[0].trim());
        conclusion = formatMarkdown(recParts[1].trim());
    }

    return { intro, recommendations, conclusion };
  };
  
  const formatMarkdown = (text: string): string => {
    // Replace all escaped tab characters with spaces
    let formatted = text.replace(/\\t/g, ' ');
    // Replace "+ " (with or without preceding spaces or tabs) with proper Markdown list items
    formatted = formatted.replace(/^\s*\+ /gm, '- ');
    // Replace escaped newlines with actual newlines
    formatted = formatted.replace(/\\n/g, '\n');
    // Remove any unnecessary quotes
    formatted = formatted.replace(/"/g, '');
    return formatted;
  };

  // Renders recommendation titles with better styling
  const renderTitle = (title: string) => {
    // Extract just the name from the title (e.g., "Temasek Polytechnic" from "**Recommendation 1: Temasek Polytechnic**")
    const titleMatch = title.match(/\*\*Recommendation \d+: (.*?)\*\*/);
    const recommendationName = titleMatch ? titleMatch[1] : title.replace(/\*\*/g, '');
    const recommendationNumber = title.match(/\d+/) ? title.match(/\d+/)[0] : "";
    
    return (
      <div className="mb-4">
        <span className="inline-block bg-rose-500 text-white text-sm px-3 py-1 rounded-full mr-2">
          {recommendationNumber}
        </span>
        <span className="text-xl font-semibold">{recommendationName}</span>
      </div>
    );
  };

  // Enhanced bullet point formatting
  const formatBulletPoints = (text: string) => {
    // Split by newlines
    return text.split('\n').map((line, index) => {
      // Check if line contains "Reasons:"
      if (line.includes('Reasons:')) {
        return (
          <div key={index} className="font-semibold text-gray-700 mb-3 mt-4 border-b border-gray-200 pb-1">
            {line.replace('* ', '')}
          </div>
        );
      }
      // Check if this is a bullet point (starts with - or + or • after potential spaces)
      else if (/^\s*[-+•]/.test(line)) {
        return (
          <div key={index} className="pl-4 mb-3 flex items-start">
            <span className="text-rose-500 mr-2 mt-1">•</span>
            <span className="text-gray-800">{line.replace(/^\s*[-+•]\s*/, '')}</span>
          </div>
        );
      }
      // Regular line
      else if (line.trim()) {
        return <p key={index} className="mb-3 text-gray-800">{line}</p>;
      }
      // Empty line
      return <div key={index} className="h-2"></div>;
    });
  };
  
  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    )
  }

  if (!parsedData) {
    return (
      <div className="p-8 text-center min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg">
          <p className="text-gray-600 text-lg">No recommendations available. Please complete the form first.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 bg-rose-500 text-white px-6 py-2 rounded-lg hover:bg-rose-600 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Your Educational Pathway Recommendations
      </h1>

      {/* Introduction Card */}
      <div className="flex items-center justify-center py-3">
          {parsedData.intro}
      </div>

      {/* Individual Recommendation Cards */}
      <div className="space-y-6">
        {parsedData.recommendations.map((recommendation, index) => {
          const [title, ...content] = recommendation.split('\n\n');
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 transform transition-transform hover:scale-[1.01] hover:shadow-lg">
              {renderTitle(title)}
              <div className="prose max-w-none">
                {formatBulletPoints(content.join('\n\n'))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Conclusion Card */}
      <div className="flex items-center justify-center py-3">
          {parsedData.conclusion}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={() => window.location.href = '/dashboard/chatbot'}
          className="bg-rose-500 text-white px-8 py-3 rounded-lg hover:bg-rose-600 transition-colors text-lg shadow-md"
        >
          Chat with AI Assistant
        </button>
      </div>
    </div>
  )
}