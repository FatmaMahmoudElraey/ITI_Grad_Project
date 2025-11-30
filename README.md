# Webify - E-commerce Platform

## Overview
Webify is a full-stack multi-vendor E-commerce platform built with Django REST Framework and React. The platform allows users to browse products, add them to cart, checkout, and manage orders. It includes features for both customers and administrators, with a focus on user experience and modern design.

## Features

### User Authentication
- Email/Password registration and login
- Google OAuth integration
- JWT authentication
- User profile management

### Shopping Experience
- Product browsing and searching
- Product categorization
- Product details with images
- Shopping cart functionality
- Persistent cart (database for authenticated users, local storage for guests)
- Checkout process
- Order history and tracking

### Admin Dashboard
- Product management (add, edit, delete)
- Approve products from different sellers
- User management
- Order management
- Sales analytics and reporting

### Seller Features
- Product listing and management
- Order fulfillment


### UI/UX
- Responsive design
- Modern and intuitive interface
- Swiper.js for interactive carousels
- Interactive components with animations


## Technology Stack

### Backend
- **Framework**: Django, Django REST Framework
- **Authentication**: Djoser, Simple JWT, Google Auth
- **Database**: SQLite (development), PostgreSQL (production ready)
- **File Storage**: Django's built-in file handling

### Frontend
- **Framework**: React with Vite
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **UI Components**: React Bootstrap, Material UI
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Styling**: CSS, Bootstrap
- **Animations**: Framer Motion
- **Carousels**: Swiper.js
- **Icons**: FontAwesome, Bootstrap Icons
- **Charts**: Chart.js with React-Chartjs-2

## Getting Started

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- pip
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd back
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file with the following variables:
   ```
   SECRET_KEY=your_secret_key
   DEBUG=True
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

5. Run migrations:
   ```
   python manage.py migrate
   ```

6. Create a superuser:
   ```
   python manage.py createsuperuser
   ```

7. Start the development server:
   ```
   python manage.py runserver
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd front
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file with the following variables:
   ```
   VITE_API_URL=http://localhost:8000/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

5. Access the application at `http://localhost:5173`

## Project Structure

### Backend
- `accounts/`: User accounts, profiles, and chat functionality
- `authsys/`: Authentication system including Google OAuth
- `products/`: Product models, views, and serializers
- `orders/`: Order processing and management
- `payments/`: Payment processing
- `webify/`: Main project settings and configuration

### Frontend
- `src/components/`: Reusable UI components
- `src/pages/`: Page components
- `src/store/`: Redux store configuration and slices
- `src/api/`: API integration
- `src/services/`: Service functions
- `src/styles/`: CSS and styling files
- `src/assets/`: Static assets like images

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements
- [React](https://reactjs.org/)
- [Django](https://www.djangoproject.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Bootstrap](https://getbootstrap.com/)
- [Swiper.js](https://swiperjs.com/)
- [Django Channels](https://channels.readthedocs.io/)
