import { useDispatch } from "react-redux";
import { getUserData } from "../https";
import { useEffect, useState } from "react";
import { removeUser, setUser } from "../redux/slices/userSlice";

const useLoadData = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Check if user session exists in localStorage
        const savedSession = localStorage.getItem("userSession");

        if (savedSession) {
          try {
            const user = JSON.parse(savedSession);
            // Restore from localStorage
            dispatch(setUser(user));
            setIsLoading(false);
            return;
          } catch (parseError) {
            console.error("Error parsing session:", parseError);
          }
        }

        // Try to fetch from API if no saved session
        try {
          const { data } = await getUserData();
          const { _id, name, email, phone, role } = data.data;
          dispatch(setUser({ _id, name, email, phone, role }));
        } catch (apiError) {
          // API failed, check if we have localStorage session to fallback
          if (!savedSession) {
            dispatch(removeUser());
          }
        }
      } catch (error) {
        console.error("Auth error:", error);
        dispatch(removeUser());
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [dispatch]);

  return isLoading;
};

export default useLoadData;
