# AcademyNet Project Readme
 
## Introduction
AcademyNet is an educational platform developed as part of an academic project for Year 3, Semester 2, 2024. The platform aims to provide a comprehensive environment for online learning, similar to systems like Coursera or Udemy. It supports functionalities for learners, instructors, and administrators, offering an extensive range of courses and a rich user experience across various devices.

## Repository Structure
The project is structured into multiple services, each running independently but interacting through well-defined interfaces. These services include:
- **Client**: A React-based frontend.
- **User Service**: Manages user data, payment and authentication.
- **Course Service**: Handles course creation, modification, and deletion.
- **Learner Service**: Manages course enrollments and learner progress.

The root of the repository contains a `package.json` file to manage scripts for running all services concurrently during development.

## Setup Instructions
### Prerequisites
- Node.js and npm must be installed.
- RabbitMQ and erlang for service orchestration.
- A modern web browser.

### Clone the Repository
Start by cloning the repository to your local machine:
```bash
git clone https://github.com/poorna-theekshana/AcademyNet.git
cd AcademyNet
```

### Environment Configuration
Each service in the project requires its own environment variables for configuration. For security reasons, `.env` files are not included in the repository. You will need to create these based on the example files provided in each service directory.

### Installing Dependencies
Navigate into each service directory and install the necessary npm packages:
```bash
# Install dependencies for the client
cd client
npm install

# Install dependencies for each service
cd ../course-service
npm install

cd ../learner-service
npm install

cd ../user-service
npm install
``` 

### Running the Services
From the root directory, you can use the following command to start all services concurrently:
```bash
npm start
```
This will launch the client and all backend services, making them interact with each other.

## Architecture and Technologies
AcademyNet is built using the Microservices architecture, ensuring scalability, maintainability, and resilience. Key technologies include:
- **React**: For building the dynamic client-side application.
- **Node.js**: Server-side JavaScript runtime.
- **Express**: Web application framework for Node.js.
- **MongoDB**: NoSQL database used for storing data.
- **RabbitMQ**: Message broker that decouples service communications with asynchronous messaging.
- **Stripe**: Payment processing platform integrated for handling financial transactions.

## Security and Authentication
The system uses JWT (JSON Web Tokens) for securely managing user sessions and authenticating requests across services. Each user role (learner, instructor, admin) has specific permissions and accessible endpoints.
