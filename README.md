This is a custom Webpack React project (not Create React App built completly in ReactJS and NextJS (in progress). 

It covers all aspects and features of how to create a modern React based Frontend application built with reusable components. Athentication requests to MongoDB is handled with Axios.

For state I have used useReducer and Context and for state immutability I have used Immer.

This project is in Progress so more updates will follow....

This is a (In Progress) web application built completly in React.JS and Next.JS.

It covers all aspects and features of how to create a modern React based Frontend application built with reusable components. Athentication is handled with MongoDB.

For state I have used useReducer and Context and for state immutability I have used Immer.

This project is in Progress so more updates will follow...

Key Technologies Used

<strong>React:</strong>

- For building UI components.
- React Router: For client-side routing.
- Immer + useImmerReducer: For global state management with immutability.
- Axios: For HTTP requests to the backend API.
- Context API: For sharing state and dispatch functions across components.
- Webpack: For bundling and serving the app.

<strong>State Management</strong>

- Uses useImmerReducer for global state (login status, user info, flash messages).
- State and dispatch are provided via React Context to all components.
- Actions like "login", "logout", and "flashMessage" update state immutably.

<strong>Routing</strong>

- Uses BrowserRouter and <Routes> for navigation.
- Routes include home, profile, create/edit/view post, about, terms, and not found.

<strong>Authentication</strong>

- Login and registration handled via Axios requests to the backend.
- User info and token are stored in localStorage and global state.

<strong>API Communication</strong>

- Axios is configured with a base URL for the backend.
- All data (posts, profiles, authentication) is fetched or updated via Axios.

<strong>Validation</strong>

- Form validation for post creation/editing is handled live as the user types, using reducer actions.

<strong>Build & Deployment</strong>

- Webpack bundles the app.

