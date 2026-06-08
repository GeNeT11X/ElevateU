import PropTypes from "prop-types";
import { useState, useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Upload,
  Sparkles,
  Star,
  AlertTriangle,
  ChevronDown,
  ExternalLink,
  Clock,
  MapPin,
  Building2,
  Briefcase,
} from "lucide-react";
import Waves from "./blocks/Backgrounds/Waves/Waves";
// import useCanvasCursor from "./blocks/canvasCursor";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/analyze";
const AnimBg = () => (
  <div className="fixed inset-0 -z-10 bg-black opacity-50">
    <div className="absolute inset-0 bg-grid-white/[0.2] bg-grid" />
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="h-[40rem] w-[40rem] animate-pulse rounded-full bg-purple-500 opacity-20 blur-3xl" />
      <div className="absolute h-[35rem] w-[35rem] animate-pulse rounded-full bg-indigo-500 opacity-20 blur-3xl" />
    </div>
  </div>
);
const ScrollP = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const updateProgress = () => {
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / scrollHeight) * 100;
      setProgress(scrolled);
    };
    window.addEventListener("scroll", updateProgress);
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50">
      <div
        className="h-full bg-gradient-to-r from-orange-100/95 to-indigo-50/90 transition-all duration-150 backdrop-blur-sm"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};const Hero = ({ funcUpload, loading }) => (
  <div className="w-screen p-4 sm:p-6 relative overflow-hidden flex items-center justify-center min-h-screen bg-gray-100">
    <div className="w-full max-w-7xl">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
            ElevateU.ai
          </h1>
          <p className="text-lg sm:text-xl text-gray-700">
            Transform your career with AI insights
          </p>
        </div>
        <label className="block w-full max-w-xl mx-auto cursor-pointer">
          <div className="bg-white shadow-lg p-6 sm:p-8 rounded-2xl border-2 border-dashed border-blue-300 hover:border-blue-400 transition-all group">
            <div className="flex flex-col text-blue-600 items-center gap-4">
              <Upload className="w-16 h-16 text-green-500 group-hover:text-blue-500 transition-colors" />
              <div className="text-center">
                <p className="text-xl font-medium">Drop your resume here</p>
                <p>or click to browse (PDF only)</p>
              </div>
            </div>
            <input
              type="file"
              accept=".pdf"
              onChange={funcUpload}
              className="hidden"
              disabled={loading}
            />
          </div>
        </label>
        {!loading && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-8 h-8 text-blue-600" />
          </div>
        )}
      </div>
    </div>
  </div>
);

Hero.propTypes = {
  funcUpload: PropTypes.func,
  loading: PropTypes.bool,
};
const Loader = () => (
  <div className="min-h-screen w-screen p-4 sm:p-6 absolute inset-0 flex backdrop-blur-3xl items-center justify-center z-50 bg-white/80">
    <div className="w-full max-w-7xl">
      <div className="flex flex-col items-center justify-center gap-8 text-gray-900">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-blue-300/20 border-t-blue-500 animate-spin" />
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-blue-500" />
        </div>
        <div className="text-lg sm:text-xl text-gray-700">
          Analyzing your resume... <br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; RuntimeTerrors 🥷
        </div>
      </div>
    </div>
  </div>
);
const getProviderColor = (provider) => {
  const colors = {
    "Coursera": "from-blue-500 to-blue-600",
    "Udemy": "from-purple-500 to-purple-600",
    "edX": "from-indigo-500 to-indigo-600",
    "Khan Academy": "from-emerald-500 to-emerald-600",
    "default": "from-gray-500 to-gray-600"
  };
  return colors[provider] || colors.default;
};

const getProviderBadgeColor = (provider) => {
  const colors = {
    "Coursera": "bg-blue-100 text-blue-700 border-blue-300",
    "Udemy": "bg-purple-100 text-purple-700 border-purple-300",
    "edX": "bg-indigo-100 text-indigo-700 border-indigo-300",
    "Khan Academy": "bg-emerald-100 text-emerald-700 border-emerald-300",
    "default": "bg-gray-100 text-gray-700 border-gray-300"
  };
  return colors[provider] || colors.default;
};

const getDifficultyColor = (level = "") => {
  const key = level.toLowerCase();
  if (key.includes("begin")) return "bg-green-100 text-green-700 border-green-300";
  if (key.includes("inter")) return "bg-amber-100 text-amber-700 border-amber-300";
  if (key.includes("adv")) return "bg-red-100 text-red-700 border-red-300";
  return "bg-gray-100 text-gray-600 border-gray-300";
};

const Courses = ({ courses = [] }) => {
  if (!courses?.length) return <p className="text-center text-gray-500">No courses available.</p>;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map((course, idx) => (
          <div
            key={idx}
            className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-purple-300 flex flex-col"
          >
            {/* Course Image */}
            {course.image ? (
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className={`h-48 bg-gradient-to-br ${getProviderColor(course.provider || "default")} flex items-center justify-center`}>
                <span className="text-white text-4xl font-bold opacity-50">
                  {course.provider?.charAt(0) || "📚"}
                </span>
              </div>
            )}

            {/* Provider Badge */}
            <div className="absolute top-3 right-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getProviderBadgeColor(course.provider || "default")} backdrop-blur-sm bg-white/90`}>
                {course.provider || "Course"}
              </span>
            </div>

            {/* Match Score Ribbon */}
            {course.matchScore != null && (
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-green-600 shadow-md">
                  <Star className="w-3 h-3 fill-white" />
                  {course.matchScore}% Match
                </span>
              </div>
            )}

            {/* Course Content */}
            <div className="p-5 flex flex-col flex-grow">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors mb-3 line-clamp-2 min-h-[3.5rem]">
                {course.title}
              </h3>

              {/* Badges: difficulty + rating */}
              {(course.difficulty || course.rating) && (
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {course.difficulty && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getDifficultyColor(course.difficulty)}`}>
                      {course.difficulty}
                    </span>
                  )}
                  {course.rating ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-300">
                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      {Number(course.rating).toFixed(1)}
                    </span>
                  ) : null}
                </div>
              )}

              {/* Course Details */}
              <div className="space-y-2 mb-4 flex-grow">
                {course.university && (
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <span className="text-purple-500">🏛️</span>
                    <span className="truncate">{course.university}</span>
                  </div>
                )}
                {course.category && (
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <span className="text-purple-500">📍</span>
                    <span className="truncate">{course.category}</span>
                  </div>
                )}
                {course.matchScore == null && course.similarity && (
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>{(course.similarity * 100).toFixed(0)}% Match</span>
                  </div>
                )}
                {course.matchedSkills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {course.matchedSkills.slice(0, 3).map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                {course.duration && !course.university && (
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{course.duration}</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <a
                href={course.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-auto inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r ${getProviderColor(course.provider || "default")} text-white font-bold rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200`}
              >
                <span className="text-base font-extrabold drop-shadow-lg tracking-wide">View Course</span>
                <ExternalLink className="w-4 h-4 drop-shadow-md" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
Courses.propTypes = {
  courses: PropTypes.array,
};
const Jobs = ({ jobs = [] }) => {
  if (!jobs?.length) return null;
  const displayJobs = jobs;
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayJobs.map((job, idx) => (
          <div
            key={idx}
            className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-400 flex flex-col"
          >
            {/* Company Logo Header */}
            <div className="relative h-32 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
              {job.companyLogo ? (
                <img
                  src={job.companyLogo}
                  alt={`${job.company} logo`}
                  className="max-w-20 max-h-20 object-contain rounded-lg bg-white p-2 shadow-sm"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="hidden items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl font-bold">
                {job.company?.charAt(0) || "J"}
              </div>
            </div>

            {/* Job Content */}
            <div className="p-5 flex flex-col flex-grow">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-3 line-clamp-2 min-h-[3.5rem]">
                {job.position}
              </h3>

              {/* Company Name */}
              <div className="flex items-center gap-2 text-blue-600 mb-4">
                <Building2 className="w-5 h-5 flex-shrink-0" />
                <span className="font-semibold truncate">{job.company}</span>
              </div>

              {/* Job Details */}
              <div className="space-y-2.5 mb-4 flex-grow">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <MapPin className="w-4 h-4 flex-shrink-0 text-gray-400" />
                  <span className="truncate">{job.location || "Location not specified"}</span>
                </div>
                {job.agoTime && (
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Clock className="w-4 h-4 flex-shrink-0 text-gray-400" />
                    <span className="truncate">{job.agoTime}</span>
                  </div>
                )}
                {job.salary && job.salary !== "Not specified" && (
                  <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                    <span>💰</span>
                    <span>{job.salary}</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <a
                href={job.jobUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <span className="text-base font-extrabold drop-shadow-lg tracking-wide">View Position</span>
                <ExternalLink className="w-4 h-4 drop-shadow-md" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


Jobs.propTypes = {
  jobs: PropTypes.array,
};
export default function ResumeAnalyzer() {
  const{ loginWithRedirect , logout, user, isAuthenticated } = useAuth0();
  loginWithRedirect;
  isAuthenticated;
  logout;
  user;
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const resultsRef = useRef(null);
  const fileUp = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await fetch(`${API_URL}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to analyze resume");

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (results && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [results]);
  /*useCanvasCursor();*/
  return (
    
      <>
      
      
      <canvas className="pointer-events-none fixed z-50 inset-0" id="canvas" />
      <div className={`relative ${loading ? "backdrop-blur-lg" : ""}`}>
        <Waves
          className="h-screen w-screen"
          lineColor="#D6BCFA" // Light purple
          backgroundColor="rgba(255, 255, 255, 0.9)" // Light background
          waveSpeedX={0.02}
          waveSpeedY={0.01}
          waveAmpX={40}
          waveAmpY={20}
          friction={0.9}
          tension={0.001}
          maxCursorMove={200}
          xGap={12}
          yGap={36}
        />

        <AnimBg />
        <ScrollP />
        <Hero funcUpload={fileUp} loading={loading} />
        {loading && <Loader />}
        <div
          ref={resultsRef}
          id="results-container"
          className="bg-[#F3E8FF] backdrop-blur-lg rounded-2xl p-4 sm:p-8 text-gray-800" // Light purple background
        >
          {error && (
            <div className="min-h-screen w-screen flex items-center justify-center p-4 sm:p-6 ">
              <div className="w-full max-w-7xl">
                <div className="bg-red-100 backdrop-blur-lg text-red-800 p-4 sm:p-8 rounded-2xl border border-red-200">
                  <AlertTriangle className="w-12 h-12 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Analysis Failed
                  </h3>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}
          {results && !loading && (
            <div ref={resultsRef} className="w-full">
              {/* Resume Score Section */}
              <div className="bg-white rounded-2xl p-4 sm:p-8 text-gray-800 shadow-sm">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  Resume Score Analysis
                </h2>
                <div className="text-4xl sm:text-5xl font-bold text-purple-500">
                  {results?.score?.total}{" "}
                  <span className="text-lg sm:text-xl">/ 100</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  {results?.score?.breakdown &&
                    Object.entries(results.score.breakdown).map(
                      ([key, value]) => {
                        if (
                          key == "ats_compatibility" ||
                          key == "industry_benchmark"
                        ) {
                          return;
                        }
                        const maxScores = {
                          skills: 25,
                          experience: 25,
                          achievements: 25,
                          education: 25,
                        };

                        const maxScore = maxScores[key];

                        return (
                          <div
                            key={key}
                            className="bg-white p-3 sm:p-4 rounded-xl border border-purple-200 shadow-sm"
                          >
                            <h3 className="text-lg font-semibold capitalize">
                              {key}
                            </h3>
                            <div className="text-xl font-bold">
                              {value}{" "}
                              <span className="text-sm">/ {maxScore}</span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-lg overflow-hidden">
                              <div
                                className="h-full bg-purple-400 rounded-lg"
                                style={{
                                  width: `${(value / maxScore) * 100}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        );
                      }
                    )}
                </div>
              </div>
              {/* Industry Benchmarks Section */}
              <div className="bg-white rounded-2xl p-4 sm:p-8 text-gray-800 mt-8 shadow-sm">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  Company Benchmarks
                </h2>
                <div className="text-4xl sm:text-5xl font-bold text-purple-500">
                  {results?.score?.breakdown.industry_benchmark}{" "}
                  <span className="text-lg sm:text-xl">/ 100</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-4 mb-8">
                  <div className="w-full bg-gray-100 h-2 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-purple-400 rounded-lg"
                      style={{
                        width: `${
                          (results?.score?.breakdown.industry_benchmark / 100) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-purple-600">Industry</span>
                        <span className="capitalize font-medium text-purple-700">
                          {results?.industry_analysis?.industry}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-purple-600">
                          Experience Level
                        </span>
                        <span className="capitalize font-medium text-purple-700">
                          {results?.industry_analysis?.experience_level}
                        </span>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-purple-600">
                          Average Industry Score
                        </span>
                        <span className="font-medium text-purple-700">
                          {
                            results?.industry_analysis?.benchmark_comparison
                              ?.average_score
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg text-green-600 font-semibold mb-2">
                        Present Industry Skills
                      </h3>
                      <div className="space-y-2">
                        {results?.industry_analysis?.benchmark_comparison?.industry_skills_present.map(
                          (skill, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-purple-600"
                            >
                              <Star className="w-5 h-5 text-purple-500" />
                              <span>{skill}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg text-red-600 font-semibold mb-2">
                        Missing Industry Skills
                      </h3>
                      <div className="space-y-2">
                        {results?.industry_analysis?.benchmark_comparison?.industry_skills_missing.map(
                          (skill, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-purple-600"
                            >
                              <Star className="w-5 h-5 text-purple-500" />
                              <span>{skill}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ATS Analysis Section */}
              <div className="bg-white rounded-2xl p-4 sm:p-8 text-gray-800 mt-8 shadow-sm">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  ATS Analysis
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                      <h3 className="text-xl font-semibold mb-4">
                        Keyword Match Score
                      </h3>
                      <div className="relative pt-4">
                        <div className="text-4xl font-bold text-purple-500 mb-2">
                          {results?.ats_analysis?.keyword_match_score}%
                        </div>
                        <div className="w-full bg-gray-100 h-3 rounded-lg overflow-hidden">
                          <div
                            className="h-full bg-purple-400 rounded-lg"
                            style={{
                              width: `${results?.ats_analysis?.keyword_match_score}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                      <h3 className="text-xl font-semibold mb-4">
                        Keyword Frequency
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(
                          results?.ats_analysis?.keyword_frequency || {}
                        ).map(([keyword, frequency]) => (
                          <div
                            key={keyword}
                            className="flex justify-between items-center"
                          >
                            <span className="text-purple-600">{keyword}</span>
                            <span className="font-medium text-purple-700">
                              {frequency}x
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg text-green-600 font-semibold mb-2">
                        Keywords Found
                      </h3>
                      <div className="space-y-2">
                        {results?.ats_analysis?.keywords_found.map(
                          (keyword, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-purple-600"
                            >
                              <Star className="w-5 h-5 text-purple-500" />
                              <span>{keyword}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg text-red-600 font-semibold mb-2">
                        Missing Keywords
                      </h3>
                      <div className="space-y-2">
                        {results?.ats_analysis?.missing_critical_keywords.map(
                          (keyword, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-purple-600"
                            >
                              <Star className="w-5 h-5 text-purple-500" />
                              <span>{keyword}</span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Salary Insights Section */}
              <div className="bg-white rounded-2xl p-4 sm:p-8 text-gray-800 mt-8 shadow-sm">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  Salary Insights
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                    <h3 className="text-xl font-semibold mb-4">
                      Estimated Salary Range
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-purple-600">Low</span>
                        <span className="font-medium text-purple-700">
                          {
                            results?.salary_insights?.estimated_salary_range
                              ?.currency
                          }{" "}
                          {results?.salary_insights?.estimated_salary_range?.low?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-purple-600">High</span>
                        <span className="font-medium text-purple-700">
                          {
                            results?.salary_insights?.estimated_salary_range
                              ?.currency
                          }{" "}
                          {results?.salary_insights?.estimated_salary_range?.high?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                    <h3 className="text-xl font-semibold mb-4">
                      Salary Factors
                    </h3>
                    <div className="space-y-2">
                      {results?.salary_insights?.salary_factors.map(
                        (factor, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-purple-600"
                          >
                            <Star className="w-5 h-5 text-purple-500" />
                            <span>{factor}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* Recommended Roles*/}
              {results?.roles?.length > 0 && (
                <div className="bg-white rounded-2xl p-4 sm:p-8 text-gray-800 mt-8 shadow-sm">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                    Recommended Roles
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {results.roles.map((role, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-4 sm:p-6 rounded-xl border border-purple-200 shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-semibold text-purple-700">
                            {role?.title ?? "Unknown Role"}
                          </h3>
                          <div className="px-2 sm:px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                            {role?.match_percentage ?? 0}% Match
                          </div>
                        </div>
                        <div className="space-y-2">
                          {role?.key_qualifications?.map((qual, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 text-purple-600"
                            >
                              <Star className="w-5 h-5 text-purple-500" />
                              <span>{qual}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills Section */}
              <div className="bg-white rounded-2xl p-4 sm:p-8 text-gray-800 mt-8 shadow-sm">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  Skills Analysis
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-lg text-green-600 font-semibold mb-2">
                      Strong Skills
                    </h3>
                    <div className="space-y-2 text-purple-600">
                      {results?.skills_analysis?.strong_skills?.length ? (
                        results.skills_analysis.strong_skills.map(
                          (skill, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <Star className="w-5 h-5 text-purple-500" />
                              <span>{skill}</span>
                            </div>
                          )
                        )
                      ) : (
                        <div className="flex items-center">
                          <Star className="w-5 h-5 text-purple-500" />
                          <span>None</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg text-red-600 font-semibold mb-2">
                      Missing Skills
                    </h3>
                    <div className="space-y-2 text-purple-600">
                      {results?.skills_analysis?.missing_skills?.length ? (
                        results.skills_analysis.missing_skills.map(
                          (skill, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <Star className="w-5 h-5 text-purple-500" />
                              <span>{skill}</span>
                            </div>
                          )
                        )
                      ) : (
                        <div className="flex items-center">
                          <Star className="w-5 h-5 text-purple-500" />
                          <span>None</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg text-yellow-600 font-semibold mb-2">
                      Improvement Areas
                    </h3>
                    <div className="space-y-2 text-purple-600">
                      {results?.skills_analysis?.improvement_areas?.length ? (
                        results.skills_analysis.improvement_areas.map(
                          (area, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <Star className="w-5 h-5 text-purple-500" />
                              <span>{area}</span>
                            </div>
                          )
                        )
                      ) : (
                        <div className="flex items-center">
                          <Star className="w-5 h-5 text-purple-500" />
                          <span>None</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Feedback*/}
              <div className="bg-white rounded-2xl p-4 sm:p-8 text-purple-600 mt-8 shadow-sm">
                <h2 className="text-2xl sm:text-3xl text-gray-800 font-bold mb-4">
                  Detailed Feedback
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col min-h-full">
                    <h3 className="text-lg text-green-600 font-semibold mb-2">
                      Strengths
                    </h3>
                    <ul className="space-y-2 list-disc text-purple-600 flex-grow">
                      {results?.detailed_feedback?.strengths?.length ? (
                        results.detailed_feedback.strengths.map(
                          (strength, i) => (
                            <li key={i} className="text-lg">
                              {strength}
                            </li>
                          )
                        )
                      ) : (
                        <li className="text-lg">None</li>
                      )}
                    </ul>
                  </div>

                  <div className="flex flex-col min-h-full">
                    <h3 className="text-lg text-red-600 font-semibold mb-2">
                      Weaknesses
                    </h3>
                    <ul className="space-y-2 list-disc text-purple-600 flex-grow">
                      {results?.detailed_feedback?.weaknesses?.length ? (
                        results.detailed_feedback.weaknesses.map(
                          (weakness, i) => (
                            <li key={i} className="text-lg">
                              {weakness}
                            </li>
                          )
                        )
                      ) : (
                        <li className="text-lg">None</li>
                      )}
                    </ul>
                  </div>

                  <div className="flex flex-col min-h-full">
                    <h3 className="text-lg text-yellow-600 font-semibold mb-2">
                      Improvement Tips
                    </h3>
                    <ul className="space-y-2 list-disc text-purple-600 flex-grow">
                      {results?.detailed_feedback?.improvement_tips?.length ? (
                        results.detailed_feedback.improvement_tips.map(
                          (tip, i) => (
                            <li key={i} className="text-lg">
                              {tip}
                            </li>
                          )
                        )
                      ) : (
                        <li className="text-lg">None</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
              {/* Course Recommendations Section */}
              {results?.course_recommendations && (
                <div className="bg-white rounded-2xl p-6 sm:p-8 text-gray-800 mt-8 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        📚 Recommended Courses
                      </h2>
                      {results.course_recommendations.providers && results.course_recommendations.providers.length > 0 && (
                        <p className="text-sm text-gray-600">
                          From {results.course_recommendations.providers.join(", ")}
                        </p>
                      )}
                    </div>
                    {results.course_recommendations.count && (
                      <div className="mt-2 sm:mt-0">
                        <span className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                          {results.course_recommendations.count} courses found
                        </span>
                      </div>
                    )}
                  </div>
                  {results.course_recommendations.error ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-red-800 font-semibold mb-1">
                            {results.course_recommendations.error}
                          </p>
                          <p className="text-sm text-red-600">
                            Make sure the course recommendation service is running on port 5001.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : results.course_recommendations.recommended_courses?.length > 0 ? (
                    <Courses courses={results.course_recommendations.recommended_courses.map(course => ({
                      title: course.title || course.name || "Untitled Course",
                      provider: course.provider || course.platform || "Coursera",
                      category: course.category || "General",
                      duration: course.duration || "Self-paced",
                      url: course.url || (course.slug ? `https://www.coursera.org/learn/${course.slug}` : "#"),
                      image: course.image || null,
                      similarity: course.similarity || null,
                      matchScore: course.match_score ?? null,
                      rating: course.rating ?? null,
                      difficulty: course.difficulty_level || null,
                      university: course.university || null,
                      matchedSkills: course.matched_skills || []
                    }))} />
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                      <p className="text-yellow-800">
                        No course recommendations available at this time.
                      </p>
                    </div>
                  )}
                </div>
              )}
              {results?.job_search_results?.length > 0 && (
                <div className="bg-white rounded-2xl p-6 sm:p-8 text-gray-800 mt-8 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-0 flex items-center gap-3">
                      <Briefcase className="w-8 h-8 text-blue-500" />
                      Matching Job Opportunities
                    </h2>
                    <div className="mt-2 sm:mt-0">
                      <span className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                        {results.job_search_results.length} positions found
                      </span>
                    </div>
                  </div>
                  <Jobs jobs={results.job_search_results} />
                </div>
              )}
            </div>
          )}
        </div>
        <footer style={{display:'flex',justifyContent:'center',alignItems:'center',textAlign:'center'}}>
          <p>&copy; 2025 ElevateU.ai. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}