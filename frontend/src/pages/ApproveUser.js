import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

const ApproveUser = () => {
    const [searchParams] = useSearchParams();
    const [message, setMessage] = useState("Processing your request...");

    useEffect(() => {
        const approveUser = async () => {
            const email = searchParams.get("email"); // Get the email from the query params
            if (!email) {
                setMessage("Invalid request. Email is missing.");
                return;
            }

            try {
                const response = await axios.get(`http://localhost:5000/api/auth/approve-user?email=${encodeURIComponent(email)}`);
                setMessage(response.data.message || "User approved successfully.");
            } catch (error) {
                console.error("Error approving user:", error);
                setMessage(error.response?.data?.message || "An error occurred while processing your request.");
            }
        };

        approveUser();
    }, [searchParams]);

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Approve User</h1>
            <p>{message}</p>
        </div>
    );
};

export default ApproveUser;