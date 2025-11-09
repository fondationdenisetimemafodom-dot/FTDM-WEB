import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../../lib/axiosInstance";
import UserNavbar from "../../components/UserNavbar";
import Footer from "../../components/Footer";
import ProjectDetailsPage from "../../components/ProjectDetailsPage";
import { Loader2 } from "lucide-react";

const ProjectDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [project, setProject] = useState(location.state?.project || null);
  const [loading, setLoading] = useState(!location.state?.project);

  useEffect(() => {
    if (!project && id) {
      const fetchProject = async () => {
        try {
          const response = await axiosInstance.get(`/api/projects/${id}`);
          setProject(response.data);
        } catch (error) {
          console.error("Failed to fetch project:", error);
          navigate("/projects");
        } finally {
          setLoading(false);
        }
      };
      fetchProject();
    }
  }, [id, project, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-main-500" />
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <UserNavbar />
      <ProjectDetailsPage
        project={project}
        onBack={() => navigate("/projects")}
      />
      <Footer />
    </div>
  );
};

export default ProjectDetails;
