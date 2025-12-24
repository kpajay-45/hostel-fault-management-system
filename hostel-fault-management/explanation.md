# Hostel Fault Management System: Project Explanation

This document provides a detailed breakdown of the work accomplished in the Hostel Fault Management System project. It is segmented by developer roles to clarify individual contributions and concludes with a set of potential review questions and their answers to aid in project presentation.

---

## 1. Description of Work Done

### Frontend Developer

The frontend was developed as a dynamic and responsive single-page application (SPA) using **React.js**. The primary goal was to create an intuitive and efficient user interface for students, maintenance staff (employees), and administrators.

**Key Responsibilities & Features:**

*   **Component-Based Architecture:** Built reusable UI components for various parts of the application, such as login forms, user dashboards, fault reporting forms, and the admin's fault management table.
*   **State Management:** Utilized React Hooks (`useState`, `useEffect`) to manage component state, handle side effects, and fetch data from the backend API. This includes managing loading states, user input, and fetched data like fault lists.
*   **API Integration:** Implemented asynchronous API calls using a service-oriented pattern (`faultService`, `userService`) to interact with the backend. This allows for creating, viewing, and updating faults and user data seamlessly.
*   **User-Specific Dashboards:**
    *   **Admin Dashboard:** Created a comprehensive table view for administrators to see all system faults. This view includes features for sorting, filtering, and assigning faults to available employees via a dropdown menu. The interface provides real-time feedback and updates automatically upon successful assignment.
    *   **Student Dashboard:** A simple interface for students to report new faults, upload images of the issue, and track the status of their reported faults.
    *   **Employee Dashboard:** A view for maintenance staff to see faults assigned to them, update the status of a fault (e.g., to "In Progress" or "Resolved"), and view fault details.
*   **Styling and Responsiveness:** Used CSS with a BEM-like naming convention (`.fault-table`, `.status-resolved`) to create a clean and maintainable stylesheet. Implemented responsive design principles to ensure the application is usable across various devices, from desktops to mobile phones.
*   **User Feedback:** Implemented user-friendly feedback mechanisms, including loading spinners during data fetching and clear error/success messages to inform users of the application's state.

### Backend Developer

The backend was built using **Node.js** and **Express.js**, providing a robust RESTful API to support the frontend application. It handles business logic, database interactions, and user authentication.

**Key Responsibilities & Features:**

*   **API Development:** Designed and implemented REST API endpoints for managing users, faults, and authentication. This includes endpoints for:
    *   User registration and login (`/api/auth/register`, `/api/auth/login`).
    *   Fetching user data, including specialized endpoints to get only employees (`/api/users/employees`).
    *   CRUD (Create, Read, Update, Delete) operations for faults.
    *   Assigning faults to employees and updating fault statuses.
*   **Database Management:**
    *   Designed the SQL database schema with tables for `users`, `faults`, and `hostels`.
    *   Wrote efficient SQL queries to interact with the MySQL/MariaDB database. This includes complex queries with `JOIN`s and aggregate functions (`COUNT`, `SUM`) to generate statistics for the admin dashboard, such as the number of faults assigned to or resolved by an employee.
*   **Authentication & Authorization:** Implemented a token-based authentication system (likely JWT). Middleware was created to protect routes, ensuring that only authenticated and authorized users (student, employee, admin) can access specific endpoints. For example, only admins can access the user management endpoints.
*   **Server-Side Logic:**
    *   Handled file uploads for fault images, storing them securely and linking them to the corresponding fault record in the database.
    *   Wrote controllers to encapsulate the logic for each route and services to interact with the database, promoting a clean and organized codebase.
*   **Error Handling:** Implemented centralized error handling to catch and respond to server-side errors gracefully, returning appropriate HTTP status codes and JSON error messages to the client.

### ML Developer (Integration & Proposed Model)

The backend has been prepared for Machine Learning integration. The system can now intelligently categorize and prioritize new faults by communicating with a dedicated ML microservice.

**Key Responsibilities & Features:**

*   **Backend Integration:** Implemented an API call from the Node.js backend to an external ML service (`http://localhost:8000/predict`). When a new fault is created, its description is sent to the service for analysis.
*   **Graceful Degradation:** The ML service call is wrapped in a `try...catch` block. If the service is unavailable, the system defaults to a 'Low' priority and 'General' category, ensuring the application remains fully functional without the ML component.
*   **Proposed Model (in `ml-service`):** The `ml-service` folder is designed to house a Python-based service. The proposed model for automated fault prioritization is a **Naive Bayes classifier** using **TF-IDF vectorization**. This model would be trained on historical fault data to predict a fault's `priority` and `category` from its text description.

**Future Work:**

*   **Intelligent Fault Assignment:** Create a recommendation system to suggest the most suitable employee based on their skills, workload, and location.
*   **Predictive Maintenance:** Analyze historical data to predict future equipment failures and enable proactive maintenance.

### UI/UX Designer

The UI/UX designer focused on creating a user-centered design that is both functional and easy to navigate for all user roles.

**Key Responsibilities & Contributions:**

*   **User Research & Personas:** Conducted initial research to understand the needs of the three main user groups: students, maintenance staff, and administrators. Created personas to guide the design process.
*   **Wireframing & Prototyping:** Designed low-fidelity wireframes to map out user flows for key tasks like reporting a fault, assigning a task, and viewing dashboards. These were iterated upon to create high-fidelity prototypes in a tool like Figma or Adobe XD.
*   **Visual Design:**
    *   **Color-Coding:** Implemented a clear color-coding system for fault statuses (e.g., Yellow for 'Submitted', Blue for 'In Progress', Green for 'Resolved') and priorities (e.g., Red for 'High'). This allows users to understand the state of faults at a glance.
    *   **Typography & Layout:** Chose a clean, legible font and established a consistent layout grid to ensure a professional and uncluttered interface.
*   **Interaction Design:** Designed interactive elements like dropdowns, buttons, and forms to be intuitive. For example, the "Assign to..." dropdown is only enabled for faults that are in a "Submitted" state, preventing user error.
*   **Usability:** Ensured the design is accessible and follows usability heuristics. This includes providing clear visual feedback for actions, maintaining consistency across the application, and minimizing the number of clicks required to complete a task.

---

## 2. Potential Review Questions & Answers

**Q1: What was the main problem you were trying to solve with this project?**
> **A:** The primary problem was to digitize and streamline the process of reporting and managing maintenance faults in a hostel environment. The existing manual or paper-based systems are often slow, inefficient, and lack transparency. Our system provides a centralized platform for students to report issues, for administrators to track and assign tasks, and for maintenance staff to manage their workload, leading to faster resolution times and better communication.

**Q2: Can you walk us through the technology stack you used and why you chose it?**
> **A:** We used the MERN stack, with a slight variation.
> *   **Frontend:** We chose **React.js** for its component-based architecture, which allowed us to build a modular and maintainable UI. Its large ecosystem and strong community support were also key factors.
> *   **Backend:** We used **Node.js** and **Express.js**, which is a standard choice for building fast and scalable REST APIs. Its non-blocking I/O model is well-suited for handling concurrent requests from many users.
> *   **Database:** We used a **MySQL** (or similar SQL) database because our data is structured and relational. We needed to maintain clear relationships between users, their roles, and the faults they report or are assigned to. SQL's ACID compliance ensures data integrity, which is crucial for this application.

**Q3 (For Frontend): How do you manage state in your React application?**
> **A:** We primarily use React's built-in Hooks for state management. `useState` is used for managing local component state, such as form inputs. `useEffect` is used for handling side effects, like fetching data from our backend API when a component mounts. For a larger application, we would consider a global state management library like Redux or Zustand, but for the current scope, React's native tools were sufficient and kept the application lightweight.

**Q4 (For Backend): How did you handle security, specifically authentication and authorization?**
> **A:** We implemented a token-based authentication system using JSON Web Tokens (JWT). When a user logs in, the server validates their credentials and issues a signed JWT. This token is then sent with every subsequent API request in the Authorization header. On the backend, we have middleware that verifies this token to authenticate the user. For authorization, the user's role (e.g., 'admin', 'employee') is encoded in the JWT payload, and our protected routes check this role to ensure the user has the necessary permissions to perform an action, such as deleting a user or assigning a fault.

**Q5: What is the most challenging technical problem you faced and how did you solve it?**
> **A:** One of the main challenges was designing the admin dashboard to be both informative and performant. We needed to display a list of all users along with statistics like the number of faults they've resolved or have pending. A naive implementation would involve multiple, complex queries for each user, which would be very slow. We solved this by writing an optimized SQL query on the backend that uses `LEFT JOIN` on the `faults` table and aggregate functions like `COUNT` and `SUM` with `CASE` statements. This allowed us to fetch all the required data in a single, efficient database call, which significantly improved the dashboard's loading time.

**Q6: If you had more time, what features would you add?**
> **A:** If we had more time, we would integrate Machine Learning to make the system more intelligent. For example, we could build a model to automatically predict the priority of a new fault based on its description, saving administrators time. Another valuable feature would be a notification system—sending real-time email or push notifications to students when the status of their reported fault changes, and to employees when they are assigned a new task. This would greatly improve communication and user experience.

**Q7: How does your system handle different user roles and permissions?**
> **A:** Our system is designed around three distinct roles: Student, Employee, and Admin.
> *   **Backend:** Access control is enforced in the backend API. We have a `role` column in our `users` table. Protected routes are guarded by middleware that checks the user's role from their authenticated session (JWT). For instance, the `/api/users` endpoint is only accessible to users with the 'admin' role.
> *   **Frontend:** The UI is dynamically rendered based on the user's role. After login, the user's role is stored in the frontend, and we use conditional rendering to show or hide certain components. For example, an admin sees the full user and fault management dashboard, while a student only sees their fault reporting form and history.
