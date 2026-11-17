import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

const PrivateRoute = ({ children }) => {
  const user = useSelector((state) => state.auth.user);

  return user && ["company", "jobseeker", "admin"].includes(user.role) ? children : <Navigate to="/login" replace />;
};
PrivateRoute.propTypes = { children: PropTypes.node.isRequired };

export default PrivateRoute;
