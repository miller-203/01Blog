## 01Blog

### Overview

In this project, you will build a **social blogging platform** called **01Blog**, where students can share their learning experiences, discoveries, and progress throughout their journey. Users can interact with each other’s content, follow one another, and engage in meaningful discussions.

This project will guide you through creating a fullstack application using **Java Spring Boot** for the backend and **Angular** for the frontend — from setting up REST APIs to building an interactive and responsive interface.

### Role Play

You are a **fullstack developer** working for a platform dedicated to helping students document their learning journey. Your mission is to create a user-friendly and secure blogging system where students can post content, subscribe to others, and report inappropriate behavior. Administrators must have tools to moderate the content and manage users.

### Learning Objectives

- Master **Java Spring Boot** (REST API, authentication, services, security)
- Build **Angular** applications (components, routing, services, UI/UX)
- Understand **fullstack architecture** and RESTful API integration
- Handle **user-generated content** (media upload, content management)
- Design and use **relational databases** for social interactions (likes, comments, subscriptions)
- Implement **secure authentication** and **role-based access**
- Create tools for **moderation and administration**
- Collaborate using **Git**, GitHub, and agile practices (issues, branches, commits)

### Instructions

#### Backend

- **Authentication**

  - User registration, login, and secure password handling
  - Role-based access control (user vs admin)

- **User Block Page**

  - Each user has a public profile (their "block") listing all their posts
  - Users can subscribe to other profiles
  - Subscribed users receive notifications when new posts are published

- **Posts**

  - Users can create/edit/delete posts with media (image or video) and text
  - Each post includes a timestamp, description, and media preview
  - Other users can like and comment on posts

- **Reports**

  - Users can report profiles for inappropriate or offensive content
  - Reports must include a reason and timestamp
  - Reports are stored and visible only to admins

- **Admin Panel**
  - Admin can view and manage all users
  - Admin can manage posts and remove inappropriate content
  - Admin can handle user reports (ban/delete user or post)
  - All admin routes must be protected by access control

#### Frontend

- **User Experience**

  - Homepage with a feed of posts from subscribed users
  - Personal block page with full post management (CRUD)
  - View other users’ blocks and subscribe/unsubscribe

- **Post Interaction**

  - Like and comment on posts (comments update in real time or via refresh)
  - Upload media (images/videos) with previews
  - Display timestamps, likes, and comments on each post

- **Notifications**

  - Notification icon showing updates from subscribed profiles
  - Mark notifications as read/unread

- **Reporting**

  - Report a user with a text reason (UI component/modal)
  - Confirmation before submitting the report

- **Admin Dashboard**

  - View all users, posts, and submitted reports
  - Delete or ban users, remove or hide posts
  - Clean UI for moderation tasks

- Use a responsive UI framework: **Angular Material** or **Bootstrap**

### Constraints

- Use **Spring Security** or **JWT** for authentication and role management
- Store media securely (in file system or using cloud storage like AWS S3)
- Use a relational SQL database (e.g., PostgreSQL or MySQL)
- All routes must be protected according to user roles
- Code generation tools (like JHipster) are **not allowed**
- The project must include a detailed **README** with:
  - How to run the backend and frontend
  - Technologies used

### Evaluation

This project is evaluated through **peer-to-peer code review** and **functional demo**. Evaluation criteria include:

- 💡 **Functionality**: All features implemented and working as expected
- 🔐 **Security**: Proper role-based access and secure user data handling
- 🎨 **UI/UX**: Responsive, intuitive, and clean interface

### Bonus Features (Optional but Recommended)

- Real-time updates using WebSockets (for comments or notifications)
- infinite scroll on feeds
- Dark mode toggle
- Basic analytics for admins (number of posts, most reported users)
- Markdown support for posts

### Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Angular Official Documentation](https://angular.io/docs)
- [Angular Material Documentation](https://material.angular.io/components/categories)
- [Spring Boot File Upload](https://www.bezkoder.com/spring-boot-upload-file-database/)
- [JWT Introduction – Auth0](https://auth0.com/learn/json-web-tokens/)
- [Spring Security Basics – Java Guides](https://www.javaguides.net/2022/01/spring-security-tutorial.html)
- [PostgreSQL Basics](https://www.postgresqltutorial.com/)
- [JPA (Java Persistence API) Guide](https://www.baeldung.com/the-persistence-layer-with-spring-data-jpa)



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


The "01Blog" project is a substantial full-stack challenge, but 20 days is a healthy amount of time if you work methodically.

Since this involves both Spring Boot and Angular, the key to success is not trying to do everything at once. You should build vertical slices (backend + frontend for one feature) rather than building the whole backend first, then the whole frontend.

Here is a 20-day roadmap and a "How to Start" guide to keep you on track.

Phase 1: Setup & Core Architecture (Days 1–3)
Before coding features, you need a solid foundation. If this is shaky, the rest will be painful.

Day 1: Project Initialization & Database Design

Backend: Initialize Spring Boot (Dependencies: Spring Web, Spring Data JPA, PostgreSQL/MySQL Driver, Lombok, Spring Security).

Frontend: Initialize Angular project (ng new 01Blog). Install UI library (Angular Material or Bootstrap).

Database: Draw your ER Diagram (Entity Relationship). You need tables for: Users, Roles, Posts, Comments, Likes, Follows, Reports.

Git: Create a repo, push initial commits.

Day 2: Backend Entities & Basic Repositories

Create your Java Entities (User.java, Post.java, etc.) mapping to your database tables using JPA annotations (@Entity, @Id, @OneToMany).

Create Repository interfaces for each entity.

Test the connection to your local PostgreSQL/MySQL database.

Day 3: Authentication (The Hard Part)

Backend: Implement Spring Security + JWT. Create endpoints for /register and /login.

Frontend: Create Login and Register components. Build an AuthService to handle the JWT token storage (localStorage) and generic HTTP interceptors to attach the token to requests.

Phase 2: Core User Features (Days 4–10)
This is the meat of the project. Focus on the "Happy Path" (users posting and viewing).

Day 4: Profile & Post Creation (Backend)

Create PostService and PostController.

Implement "Create Post" API (handle file upload for media images/video).

Implement "Get User Profile" API.

Day 5: Profile & Post Creation (Frontend)

Build the "Create Post" UI (form with file input). Connect it to the backend.

Build the "User Profile/Block" page to display a list of that user's posts.

Day 6: The Feed & Following System

Backend: Create the "Follow" logic (User A follows User B). Create an endpoint to get the "Feed" (posts from people I follow).

Frontend: Build the Home Page. Use an *ngFor loop to display the feed.

Day 7: Interactions (Likes & Comments)

Backend: API endpoints for liking a post and adding a comment.

Frontend: Add "Like" buttons and a "Comment" section to the post component. Ensure the UI updates when you click them.

Day 8: Notifications

Backend: When a user posts, create a notification record for their followers.

Frontend: Create a Notification component/dropdown to list these updates.

Day 9: Polish User Features

Handle edge cases: What if the image is too big? What if the user doesn't exist?

Add the "Block/Unsubscribe" logic.

Day 10: Buffer Day

Use this day to catch up if you are behind or to fix bugs.

Phase 3: Moderation & Administration (Days 11–14)
Now that users can create content, you need to control it.

Day 11: Reporting System

Backend: API to POST /report with a reason.

Frontend: Add a "Report" button to posts/profiles with a simple modal popup for the reason.

Day 12: Admin Dashboard (Backend)

Create Admin-only endpoints (@PreAuthorize("hasRole('ADMIN')")).

Need APIs to: Get all users, Get all reports, Delete any post, Ban user.

Day 13: Admin Dashboard (Frontend)

Create a specific layout for Admins.

Build a table (using Material Table or standard HTML table) to list reports and users.

Add "Delete" and "Ban" buttons.

Day 14: Security Audit

Test that a normal user cannot access Admin pages.

Test that User A cannot delete User B's post.

Phase 4: UI/UX Polish & Finalization (Days 15–20)
Make it look good and prepare for submission.

Day 15: Styling & Responsiveness

Ensure the site looks good on mobile (use Flexbox/Grid).

Make sure images fit correctly in their containers.

Day 16: Error Handling & Loading States

Add loading spinners while data is fetching.

Add "Toast" notifications (e.g., "Post created successfully!", "Login failed").

Day 17: README & Documentation

Write the README.md. This is a requirement.

Explain how to run the DB, Backend, and Frontend.

Take screenshots of your app for the documentation.

Day 18: Code Cleanup

Remove System.out.println from backend.

Remove console.log from frontend.

Format your code.

Day 19: Final Testing

Do a full "role play". Create a user, post, log out, log in as admin, ban the user.

Fix any critical bugs found.

Day 20: Submission Ready

Final commit and push.

Relax.

How to Start Right Now (Step-by-Step)
1. The Database Diagram (The "Model") Before writing code, visualize your data. A simple sketch is fine.

User: ID, username, email, password, role.

Post: ID, content, image_url, timestamp, user_id (Foreign Key).

Follow: follower_id, followed_id.

Report: ID, reporter_id, reported_entity_id, reason.

2. Initialize the Backend Go to start.spring.io.

Project: Maven

Language: Java

Spring Boot: (Latest Stable)

Dependencies: Spring Web, Spring Data JPA, PostgreSQL Driver (or MySQL), Lombok, Spring Security.

Download & Open in IntelliJ/Eclipse.

3. Configure application.properties Set up your database connection immediately so the app runs without crashing.

Properties

spring.datasource.url=jdbc:postgresql://localhost:5432/01blog
spring.datasource.username=postgres
spring.datasource.password=yourpassword
spring.jpa.hibernate.ddl-auto=update
4. Create Your First Entity (User.java) This is the first piece of code you should write.

Java

@Entity
@Data // Lombok
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String username;

    private String password;
    private String role; // "USER" or "ADMIN"
}
Next Step for You: Do you have your development environment (Java JDK, Node.js/Angular CLI, and PostgreSQL/MySQL) installed and ready? If yes, start by generating the Spring Boot project now.