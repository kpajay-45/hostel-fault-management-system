# Hostel Fault Management System

A full-stack web application designed to streamline the process of reporting, managing, and resolving maintenance issues within a hostel. The system features distinct dashboards for students, maintenance employees, and administrators, with an intelligent fault categorization system powered by machine learning.

## Tech Stack

*   **Frontend:** React.js
*   **Backend:** Node.js, Express.js
*   **Database:** MySQL
*   **Authentication:** JSON Web Tokens (JWT), Google Sign-In (planned)
*   **Machine Learning:** Python, FastAPI, Scikit-learn (planned)
*   **Notifications:** Nodemailer (planned)

---

## Current Progress (Phase 1: Backend Core)

We have successfully built the foundational backend infrastructure and core API endpoints.

### 1. Project Structure
- A **monorepo** structure has been established with two main directories:
  - `/client`: For the React frontend application.
  - `/server`: For the Node.js/Express backend API.

### 2. Database
- A **MySQL** database schema (`hostel_db`) has been designed and created.
- Tables for `users` and `faults` are in place, with appropriate relationships (foreign keys) defined.
- The `users` table supports roles (`student`, `employee`, `admin`) in a single, efficient structure.

### 3. Backend Server & API
- An **Express.js** server is running and configured to handle API requests.
- Environment variables (like database credentials and JWT secrets) are securely managed using a `.env` file.
- A connection pool to the MySQL database is established for efficient query handling.

### 4. Authentication & Authorization
- **User Registration (`POST /api/auth/register`):** New users can sign up with their name, email, and password. Passwords are securely hashed using `bcryptjs`.
- **User Login (`POST /api/auth/login`):** Authenticated users receive a JSON Web Token (JWT) to use for subsequent requests.
- **Route Protection:** A `protect` middleware has been created to secure endpoints, allowing access only to logged-in users by validating their JWT.
- **Role-Based Access Control:** An `adminOnly` middleware has been implemented to restrict certain endpoints to users with the 'admin' role.

### 5. Core API Endpoints
- **Submit a Fault (`POST /api/faults`):** A protected endpoint for logged-in users to report a new fault.
- **View My Faults (`GET /api/faults/my-faults`):** A protected endpoint for users to retrieve a list of all faults they have submitted.
- **View All Faults (`GET /api/faults/all`):** An admin-only endpoint that retrieves every fault report from the database, including the reporter's name.

---

## Next Steps: Project Roadmap

The following phases will focus on building out the remaining backend features, implementing the machine learning component, and developing the frontend user interface.

### Phase 2: Backend Feature Expansion

1.  **Admin/Employee Functionality:**
    -   **Assign Fault:** Create an endpoint (`PUT /api/faults/:id/assign`) for an admin to assign a fault to a specific employee.
    -   **Update Status:** Create an endpoint (`PUT /api/faults/:id/status`) for an employee or admin to change the status of a fault (e.g., to 'In Progress' or 'Resolved').
    -   **View Assigned Faults:** Create an endpoint (`GET /api/faults/assigned`) for an employee to see all tasks assigned to them.
2.  **Google Sign-In:**
    -   Implement the backend logic to handle user registration and login via Google OAuth 2.0.
3.  **Email Notifications:**
    -   Integrate **Nodemailer** with Gmail to send automatic email notifications to users when the status of their fault report is updated.

### Phase 3: Machine Learning Service

1.  **Create ML Service:**
    -   Set up a separate microservice using **Python** and **FastAPI**.
2.  **Train Model:**
    -   Train a text classification model (e.g., a Naive Bayes or SVM classifier using **Scikit-learn**) on a dataset of fault descriptions and their categories (e.g., "Leaking tap" -> "Plumbing").
3.  **Create Prediction Endpoint:**
    -   Expose a simple API endpoint (e.g., `/predict`) in the FastAPI service that accepts a text description and returns a predicted category.
4.  **Integration:**
    -   Modify the `createFault` controller in the Node.js backend to call this ML service, automatically populating the `category` field when a new fault is submitted.

### Phase 4: Frontend Development (React)

1.  **Setup & Routing:**
    -   Install necessary libraries like `axios` for API calls and `react-router-dom` for navigation.
    -   Set up a global state management solution (React Context API is a good start) to handle user authentication status and JWT.
2.  **Authentication Pages:**
    -   Build the UI for the Login and Registration pages, including the Google Sign-In button.
3.  **Dashboard Components:**
    -   Create a main dashboard layout that conditionally renders components based on the logged-in user's role.
    -   **Student Dashboard:** A form to submit new faults and a list/card view of their reported faults with status tracking.
    -   **Admin Dashboard:** A comprehensive table view of all faults with features for filtering, sorting, and assigning tasks to employees.
    -   **Employee Dashboard:** A simple, clear list of tasks assigned to the employee, with options to update the status.

### Phase 5: Final Touches & Deployment

1.  **Refinement:**
    -   Add loading indicators, error handling, and user feedback on the frontend.
    -   Ensure the UI is responsive and works well on different screen sizes.
2.  **Deployment:**
    -   Deploy the backend server (e.g., on Heroku or a cloud provider).
    -   Deploy the frontend application (e.g., on Vercel or Netlify).
    -   Configure environment variables for the production environment.



<!--
[PROMPT_SUGGESTION]Let's start Phase 2 by creating the endpoint for an admin to assign a fault to an employee.[/PROMPT_SUGGESTION]
[PROMPT_SUGGESTION]Can you explain more about how to set up the Google Sign-In on the backend?[/PROMPT_SUGGESTION]

Second report -->


# Hostel Fault Management System (HFMS)

This is a full-stack web application designed to streamline the process of reporting, managing, and resolving faults within a hostel environment. It features a modern, role-based architecture with a React frontend, a Node.js/Express backend, and a Python-based machine learning microservice for intelligent fault processing.

## Key Features & Work Completed

The application is built with a professional, decoupled architecture, ensuring scalability and maintainability.

### 1. Technology Stack

*   **Frontend:** React, React Router, Axios, Chart.js.
*   **Backend:** Node.js, Express.js, JWT for authentication, bcryptjs for hashing.
*   **Database:** MySQL.
*   **Machine Learning Service:** Python with FastAPI and Scikit-learn.
*   **File Uploads:** Multer for handling image uploads.
*   **Email Notifications:** Nodemailer for sending transactional emails.

### 2. Role-Based Access Control (RBAC)

The system is built around three distinct user roles, each with a tailored dashboard and specific permissions enforced on both the frontend and backend.

*   **Student:**
    *   Can register and log in (standard email/password or Google Sign-In).
    *   Lands directly on a dedicated "Report a Fault" page after login.
    *   Can submit detailed fault reports including hostel name, floor, location, a detailed description, and an optional image upload.
    *   Can view a list of their own previously submitted faults and their current status.

*   **Admin:**
    *   Has a comprehensive dashboard to view all faults submitted across the system.
    *   Can assign any "Submitted" fault to an available employee from a dropdown list.
    *   Can access a "User Management" page to view all users, change their roles, and delete accounts.
    *   Can view a dedicated "Analytics" page with interactive charts visualizing faults by status and priority.

*   **Employee:**
    *   Has a focused dashboard showing only the faults that have been assigned to them.
    *   Can update the status of their assigned tasks (e.g., mark a fault as "Resolved").

### 3. Intelligent Fault Processing (ML Microservice)

A standout feature of this project is its separate Python-based microservice that provides intelligent analysis of new fault reports.

*   **Automatic Categorization & Prioritization:** When a student submits a fault, the Node.js backend sends the description to the Python service. This service uses a keyword-based model to automatically determine the fault's `category` (e.g., Electrical, Plumbing, IT) and `priority` (High, Medium, Low).
*   **Decoupled & Scalable:** This microservice architecture allows the ML model to be updated and improved independently without affecting the main application.

### 4. Automated Email Notification System

To ensure clear communication and timely updates, the system automatically sends emails at key points in the workflow:

*   **New Fault Submitted:** All administrators receive an email notification, ensuring immediate awareness of new issues.
*   **Fault Resolved:** When an employee marks a fault as "Resolved," an email is sent to both the student who reported it (closing the loop) and all administrators (for oversight).

### 5. Modern User Interface

*   The frontend is built as a Single Page Application (SPA) using React.
*   It features a professional dashboard layout with a persistent sidebar for navigation and a top navigation bar with a user profile dropdown.
*   Styling is managed with CSS Modules to create scoped, conflict-free component styles.
*   The UI includes loading indicators (spinners) for a better user experience while data is being fetched.

---

## Pending Work & Future Enhancements

The current application provides a solid foundation. The following features are planned for future development to further enhance its capabilities.

### 1. Fault Communication & History

*   **Comments Section:** Implement a feature allowing employees and admins to add comments or updates to a fault report. This would be visible to the student and would serve as a log of actions taken.

### 2. User Account Features

*   **Forgot/Reset Password:** Add a secure "Forgot Password" flow for users who registered with an email and password, involving token generation and email links.
*   **User Profile Page:** Create a page where users can view and update their own profile information (e.g., name, room number).

### 3. Advanced Machine Learning

*   **Train a True ML Model:** Replace the current keyword-based prediction logic with a more robust model. This would involve:
    *   Using `scikit-learn` to train a text classifier (e.g., Naive Bayes, SVM) on fault descriptions.
    *   Creating a new endpoint or process for the model to learn from newly resolved faults, improving its accuracy over time.

### 4. Real-Time Functionality

*   **WebSocket Integration:** Use a library like `Socket.IO` to push real-time updates to the frontend. This would allow dashboards to update instantly when a new fault is submitted or a status changes, without requiring a page refresh.

### 5. Deployment & Production

*   **Containerization:** Create `Dockerfile` configurations for the React frontend, Node.js backend, and Python ML service.
*   **Orchestration:** Use `docker-compose` to easily run the entire multi-service application locally for development and testing.
*   **Cloud Deployment:** Develop a strategy for deploying the containerized application to a cloud provider like AWS, Google Cloud, or Heroku.

### 6. Testing

*   **Backend Unit/Integration Tests:** Use a framework like `Jest` or `Mocha` to write tests for the API endpoints and business logic in the Node.js server.
*   **Frontend Component/E2E Tests:** Use Jest and React Testing Library to test individual components and user flows on the frontend.

This `README.md` provides a comprehensive snapshot of your project's current state and a clear roadmap for its future development.

<!--
[PROMPT_SUGGESTION]Let's add a feature for employees to add comments to a fault report.[/PROMPT_SUGGESTION]
[PROMPT_SUGGESTION]How can I implement a "Forgot Password" feature?[/PROMPT_SUGGESTION]

third report -->

# Hostel Fault Management System (HFMS)

This is a full-stack web application designed to streamline the process of reporting, managing, and resolving faults within a hostel environment. It features a modern, role-based architecture with a React frontend, a Node.js/Express backend, and a Python-based machine learning microservice for intelligent fault processing.

## Key Features & Work Completed

The application is built with a professional, decoupled architecture, ensuring scalability and maintainability.

### 1. Technology Stack

*   **Frontend:** React, React Router, Axios, Chart.js.
*   **Backend:** Node.js, Express.js, JWT for authentication, bcryptjs for hashing.
*   **Database:** MySQL.
----
----
*   **Machine Learning Service:** Python with FastAPI and Scikit-learn.
*   **File Uploads:** Multer for handling image uploads.
*   **Email Notifications:** Nodemailer for sending transactional emails.
*   **Real-Time Updates:** Socket.IO for WebSocket integration.

### 2. Role-Based Access Control (RBAC)

The system is built around three distinct user roles, each with a tailored dashboard and specific permissions enforced on both the frontend and backend.

*   **Student:**
    *   Can register and log in (standard email/password or Google Sign-In).
    *   Lands directly on a dedicated "Report a Fault" page after login.
    *   Can submit detailed fault reports including hostel name, floor, location, a detailed description, and an optional image upload.
    *   Can view a list of their own previously submitted faults and their current status.

*   **Admin:**
    *   Has a comprehensive dashboard to view all faults submitted across the system.
    *   Can assign any "Submitted" fault to an available employee from a dropdown list.
    *   Can access a "User Management" page to view all users, change their roles, and delete accounts.
    *   Can view a dedicated "Analytics" page with interactive charts visualizing faults by status and priority.

*   **Employee:**
    *   Has a focused dashboard showing only the faults that have been assigned to them.
    *   Can update the status of their assigned tasks (e.g., mark a fault as "Resolved").

### 3. Intelligent Fault Processing (ML Microservice)

A standout feature of this project is its separate Python-based microservice that provides intelligent analysis of new fault reports.

*   **Trained ML Models:** The service uses models trained with `scikit-learn` on a sample dataset (`fault_data.csv`) to predict both the `category` (e.g., Electrical, Plumbing, IT) and `priority` (High, Medium, Low) of a new fault based on its description.
*   **Decoupled & Scalable:** This microservice architecture allows the ML models to be retrained and improved independently by simply updating the CSV data and running the `train.py` script, without affecting the main application.

### 4. Automated Email Notification System

To ensure clear communication and timely updates, the system automatically sends emails at key points in the workflow:

*   **New Fault Submitted:** All administrators receive an email notification, ensuring immediate awareness of new issues.
*   **Fault Resolved:** When an employee marks a fault as "Resolved," an email is sent to both the student who reported it (closing the loop) and all administrators (for oversight).

### 5. Real-Time Functionality with WebSockets

*   **Instant Updates:** The application uses `Socket.IO` to push real-time updates to the frontend.
*   **Dynamic Dashboards:** When a new fault is created or an existing one is updated (e.g., assigned or resolved), the relevant dashboards for all connected users update instantly without requiring a page refresh.

### 6. Modern & Responsive User Interface

*   **Professional Layout:** The frontend features a modern dashboard layout with a fixed, collapsible sidebar and a fixed top navigation bar, ensuring a consistent and professional user experience.
*   **Responsive Design:** The UI is designed to be responsive. On smaller screens, the sidebar collapses to an icon-only view to maximize content space, and tables can be scrolled horizontally.
*   **Component-Based Styling:** CSS Modules are used for component-specific styles to prevent conflicts, and a central `styles` directory organizes all CSS files for better maintainability.
*   **Enhanced UX:** The application includes loading indicators (spinners) for asynchronous operations and provides clear user feedback messages.

---

## Pending Work & Future Enhancements

The current application provides a solid foundation. The following features are planned for future development to further enhance its capabilities.

### 1. Fault Communication & History

*   **Comments Section:** Implement a feature allowing employees and admins to add comments or updates to a fault report. This would be visible to the student and would serve as a log of actions taken.

### 2. User Account Features

*   **Forgot/Reset Password:** Add a secure "Forgot Password" flow for users who registered with an email and password, involving token generation and email links.
*   **User Profile Page:** Create a page where users can view and update their own profile information (e.g., name, room number).

### 3. Advanced Machine Learning

*   **Continuous Learning:** Create a new endpoint or process for the ML model to learn from newly resolved and categorized faults, allowing it to improve its accuracy over time.
*   **Advanced Text Analysis:** Explore more advanced NLP techniques (e.g., using pre-trained embeddings like Word2Vec or BERT) for even more nuanced categorization and priority prediction.

### 4. Deployment & Production

*   **Containerization:** Create `Dockerfile` configurations for the React frontend, Node.js backend, and Python ML service.
*   **Orchestration:** Use `docker-compose` to easily run the entire multi-service application locally for development and testing.
*   **Cloud Deployment:** Develop a strategy for deploying the containerized application to a cloud provider like AWS, Google Cloud, or Heroku.

### 5. Testing

*   **Backend Unit/Integration Tests:** Use a framework like `Jest` or `Mocha` to write tests for the API endpoints and business logic in the Node.js server.
*   **Frontend Component/E2E Tests:** Use Jest and React Testing Library to test individual components and user flows on the frontend.

