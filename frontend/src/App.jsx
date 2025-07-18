import { Routes, Route, useLocation } from "react-router-dom";
import EmployerDashboard from "./pages/employer/EmployerDashboard";
import JobseekerDashboard from "./pages/jobSeeker/JobSeekerDashboard";
import ProtectedRoute from "./components/Protected";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Unauthorized from "./pages/Unauthorized";
import Home from "./pages/Home";
import PublicNavbar from "./components/PublicNavbar";
import EmployerNavbar from "./components/employerDashboard/EmployerNavbar";
import JobseekerNavbar from "./components/jobSeekerDashboard/JobSeekerNavbar";
import PostJobForm from "./pages/employer/PostJobForm";
import ViewAppsPage from "./pages/employer/ViewApplications";
import EditJobForm from "./pages/employer/EditJobForm";
import ApplicantProfilePage from "./pages/employer/ApplicantProfilePage";
import EmployerProfile from "./pages/employer/EmployerProfile";
import About from "./pages/About";
import ResumeUpload from "./components/jobSeekerDashboard/ResumeUpload";
import AppliedJobs from "./pages/jobSeeker/AppliedJobs";
import EditProfile from "./pages/jobSeeker/EditProfile";
import JobsList from "./pages/jobSeeker/JobsList";
import JobDetail from "./pages/jobSeeker/JobDetail";
import SavedJobs from "./pages/jobSeeker/SavedJobs";
import JobseekerProfile from "./pages/jobSeeker/JobseekerProfile";
import NotificationsPage from "./pages/NotificationsPage";
import MatchingJobs from "./pages/jobSeeker/MatchingJobs";
import ChatPage from "./pages/ChatPage";
import ChatInbox from "./pages/ChatInbox";
import ChatWrapper from "./pages/ChatWrapper";
import PrivateRoute from "./components/PrivateRoute";
import Footer from "./components/Footer";
import PublicJobsList from "./pages/PublicJobsList";
import FAQs from "./pages/FAQs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import HelpCenter from "./pages/HelpCenter";
import Contact from "./pages/Contact";

export default function App() {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // 👇 All public routes start with these
  const isPublic = [
    "/",
    "/home",
    "/about",
    "/login",
    "/register",
    "/contact",
    "/faqs",
    "/privacy-policy",
    "/terms-of-service",
    "/help",
    "/contact",
  ].some((path) => location.pathname === path);

  // 👇 Which navbar to show
  const showFooter = [
    "/",
    "/home",
    "/about",
    "/jobs-public",
    "/login",
    "/register",
    "/faqs",
    "/privacy-policy",
    "/terms-of-service",
    "/help",
    "/contact",
  ].includes(location.pathname);

  let NavbarComponent = null;

  const isEmployerPath =
    location.pathname.startsWith("/employer") ||
    location.pathname.startsWith("/chat");
  const isJobseekerPath =
    location.pathname.startsWith("/jobseeker") ||
    location.pathname.startsWith("/chat");

  if (!token || isPublic) {
    NavbarComponent = <PublicNavbar />;
  } else if (isEmployerPath && role === "employer") {
    NavbarComponent = <EmployerNavbar />;
  } else if (isJobseekerPath && role === "jobseeker") {
    NavbarComponent = <JobseekerNavbar />;
  }

  return (
    <>
      {NavbarComponent}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/jobs-public" element={<PublicJobsList />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/contact" element={<Contact />} />

        {/* Employer Routes */}
        <Route
          path="/employer/dashboard"
          element={
            <ProtectedRoute roles={["employer"]}>
              <EmployerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer/new-job"
          element={
            <ProtectedRoute allowedRole="employer">
              <PostJobForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:userId?"
          element={
            <PrivateRoute>
              <ChatInbox />
            </PrivateRoute>
          }
        />

        <Route path="/chat/:userId" element={<ChatWrapper />} />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer/profile"
          element={
            <ProtectedRoute allowedRole="employer">
              <EmployerProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer/job/:id"
          element={
            <ProtectedRoute allowedRole="employer">
              <ViewAppsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer/edit-job/:id"
          element={
            <ProtectedRoute allowedRole="employer">
              <EditJobForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employer/applicant/:userId"
          element={
            <ProtectedRoute allowedRole="employer">
              <ApplicantProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Jobseeker Routes */}
        <Route
          path="/jobseeker/dashboard"
          element={
            <ProtectedRoute roles={["jobseeker"]}>
              <JobseekerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute roles={["employer", "jobseeker"]}>
              <ChatInbox />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat/:userId"
          element={
            <ProtectedRoute roles={["employer", "jobseeker"]}>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/jobseeker/matching-jobs"
          element={
            <ProtectedRoute roles={["jobseeker"]}>
              <MatchingJobs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/jobseeker/upload-resume"
          element={
            <ProtectedRoute roles={["jobseeker"]}>
              <ResumeUpload />
            </ProtectedRoute>
          }
        />

        <Route
          path="/jobseeker/applied-jobs"
          element={
            <ProtectedRoute roles={["jobseeker"]}>
              <AppliedJobs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/jobs"
          element={
            <ProtectedRoute roles={["jobseeker", "public"]}>
              <JobsList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/jobs/:id"
          element={
            <ProtectedRoute roles={["jobseeker"]}>
              <JobDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/jobseeker/saved-jobs"
          element={
            <ProtectedRoute roles={["jobseeker"]}>
              <SavedJobs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/jobseeker/edit-profile"
          element={
            <ProtectedRoute roles={["jobseeker"]}>
              <EditProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/jobseeker/profile"
          element={
            <ProtectedRoute roles={["jobseeker"]}>
              <JobseekerProfile />
            </ProtectedRoute>
          }
        />

        <Route path="unauthorized" element={<Unauthorized />} />
      </Routes>
      {showFooter && <Footer />}
    </>
  );
}
