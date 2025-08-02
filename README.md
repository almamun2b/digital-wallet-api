# Digital Wallet API

A comprehensive REST API for managing digital wallet transactions, built with Node.js, Express, MongoDB, and TypeScript. This API provides secure financial transaction capabilities including transfers, cash-in/out operations, and multi-role user management.

## Project Overview

The Digital Wallet API is a robust financial management system that enables users to perform various digital transactions securely. The system supports multiple user roles (Super Admin, Admin, Agent, User) with role-based access control and provides comprehensive transaction management with real-time balance tracking.

### Key Capabilities

- **Multi-role User Management**: Super Admin, Admin, Agent, and User roles with specific permissions
- **Secure Authentication**: JWT-based authentication with refresh tokens and Google OAuth integration
- **Wallet Management**: Individual wallets with balance tracking and transaction limits
- **Transaction Processing**: Real-time transaction processing with fee calculation and commission handling
- **Agent Network**: Agent-based cash-in/out services for users
- **Admin Controls**: Administrative functions for user management and system oversight

## Features

### 🔐 Authentication & Authorization

- **JWT Authentication**: Secure token-based authentication with access and refresh tokens
- **Google OAuth**: Social login integration with Passport.js
- **Role-based Access Control**: Four-tier user role system (Super Admin, Admin, Agent, User)
- **Session Management**: Express session handling with secure cookie management
- **Password Security**: Bcrypt hashing with configurable salt rounds

### 👥 User Management

- **User Registration**: Secure user account creation with email verification
- **Profile Management**: Complete user profile with personal information
- **Agent Application**: Users can apply to become agents
- **Admin Controls**: User activation/deactivation and role management
- **Multi-auth Support**: Support for multiple authentication providers

### 💰 Wallet System

- **Individual Wallets**: Each user gets a unique wallet with wallet number
- **Initial Balance**: New users receive ৳50 starting balance
- **Balance Tracking**: Real-time balance updates with transaction history
- **Transaction Limits**: Daily (৳50,000) and monthly (৳500,000) limits
- **Multi-currency Support**: Built-in currency handling (default: BDT)

### 💸 Transaction Management

- **Money Transfer**: Peer-to-peer money transfers between users
- **Cash-In Services**: Agent-facilitated cash deposits
- **Cash-Out Services**: Agent-facilitated cash withdrawals
- **Withdrawal Requests**: Direct withdrawal processing
- **Deposit Operations**: Admin-controlled balance deposits
- **Transaction Fees**: Configurable fee structure with agent commissions
- **Transaction History**: Comprehensive transaction logging and retrieval

### 📊 Administrative Features

- **Transaction Monitoring**: Real-time transaction oversight
- **User Management**: Complete user lifecycle management
- **Agent Network Management**: Agent approval and monitoring
- **System Analytics**: Transaction and user analytics
- **Refund Processing**: Transaction reversal capabilities

## Tech Stack

### Backend Framework

- **Node.js**: Runtime environment
- **Express.js**: Web application framework
- **TypeScript**: Type-safe JavaScript development

### Database

- **MongoDB**: NoSQL database for data storage
- **Mongoose**: ODM for MongoDB with schema validation

### Authentication & Security

- **JWT (jsonwebtoken)**: Token-based authentication
- **Passport.js**: Authentication middleware
- **bcryptjs**: Password hashing
- **express-session**: Session management
- **cookie-parser**: Cookie handling

### Validation & Error Handling

- **Zod**: Schema validation and type safety
- **http-status-codes**: HTTP status code constants
- **Custom Error Handling**: Centralized error management

### Development Tools

- **ESLint**: Code linting and formatting
- **ts-node-dev**: Development server with hot reload
- **TypeScript**: Static type checking

### Cloud Services

- **Vercel**: Deployment platform

## API Endpoints

### Authentication Routes (`/api/v1/auth`)

| Method | Endpoint           | Description                              | Access        |
| ------ | ------------------ | ---------------------------------------- | ------------- |
| `POST` | `/login`           | User login with credentials              | Public        |
| `POST` | `/refresh-token`   | Get new access token using refresh token | Public        |
| `POST` | `/logout`          | User logout                              | Public        |
| `POST` | `/reset-password`  | Reset user password                      | Authenticated |
| `GET`  | `/google`          | Initiate Google OAuth login              | Public        |
| `GET`  | `/google/callback` | Google OAuth callback                    | Public        |

### User Management Routes (`/api/v1/user`)

| Method | Endpoint                | Description                       | Access             |
| ------ | ----------------------- | --------------------------------- | ------------------ |
| `POST` | `/register`             | Register new user account         | Public             |
| `GET`  | `/all-users`            | Get all users (with pagination)   | Super Admin, Admin |
| `GET`  | `/me`                   | Get current user profile          | Authenticated      |
| `GET`  | `/apply-for-agent`      | Apply to become an agent          | User               |
| `PUT`  | `/update-profile`       | Update user profile               | Authenticated      |
| `POST` | `/manage-agent/:userId` | Approve/reject agent applications | Super Admin, Admin |

### Wallet Management Routes (`/api/v1/wallet`)

| Method  | Endpoint                | Description                       | Access             |
| ------- | ----------------------- | --------------------------------- | ------------------ |
| `GET`   | `/my-wallet`            | Get current user's wallet details | Authenticated      |
| `PATCH` | `/:walletId/change-pin` | Change wallet PIN                 | Authenticated      |
| `POST`  | `/:walletId/verify-pin` | Verify wallet PIN                 | Authenticated      |
| `GET`   | `/:walletId/stats`      | Get wallet statistics             | Authenticated      |
| `GET`   | `/:walletNumber`        | Get wallet by wallet number       | Authenticated      |
| `GET`   | `/all-wallets`          | Get all wallets                   | Super Admin, Admin |
| `PUT`   | `/update-limits`        | Update wallet transaction limits  | Super Admin, Admin |
| `PATCH` | `/:walletId/status`     | Update wallet status              | Super Admin, Admin |
| `PATCH` | `/:walletId/limits`     | Get wallet transaction limits     | Super Admin, Admin |

### Transaction Routes (`/api/v1/transaction`)

#### User Transactions

| Method | Endpoint           | Description                    | Access        |
| ------ | ------------------ | ------------------------------ | ------------- |
| `POST` | `/transfer`        | Transfer money to another user | User          |
| `POST` | `/cash-out`        | Request cash-out through agent | User          |
| `GET`  | `/my-transactions` | Get user's transaction history | Authenticated |

#### Agent Transactions

| Method | Endpoint   | Description               | Access |
| ------ | ---------- | ------------------------- | ------ |
| `POST` | `/cash-in` | Process cash-in for users | Agent  |

#### Admin Transactions

| Method | Endpoint                 | Description                  | Access             |
| ------ | ------------------------ | ---------------------------- | ------------------ |
| `GET`  | `/all-transactions`      | Get all system transactions  | Super Admin, Admin |
| `POST` | `/deposit`               | Deposit money to user wallet | Super Admin, Admin |
| `POST` | `/:transactionId/refund` | Process transaction refund   | Super Admin, Admin |
| `GET`  | `/:transactionId`        | Get transaction by ID        | Authenticated      |

## Request/Response Examples

### Authentication Examples

#### User Login

```json
POST /api/v1/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "statusCode": 200,
  "success": true,
  "message": "Logged in successfully!",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER"
    }
  }
}
```

#### Refresh Token

```json
POST /api/v1/auth/refresh-token
// Refresh token sent via cookies

Response:
{
  "statusCode": 200,
  "success": true,
  "message": "Access token generated successfully!",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### User Logout

```json
POST /api/v1/auth/logout

Response:
{
  "statusCode": 200,
  "success": true,
  "message": "Logged out successfully!",
  "data": null
}
```

#### Reset Password

```json
POST /api/v1/auth/reset-password
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}

Response:
{
  "statusCode": 200,
  "success": true,
  "message": "Password reset successfully!",
  "data": null
}
```

#### Google OAuth Login

```json
GET /api/v1/auth/google
// Redirects to Google OAuth consent screen

GET /api/v1/auth/google/callback
// Google OAuth callback with authorization code
// Redirects to frontend with authentication cookies set
```

### User Management Examples

#### User Registration

```json
POST /api/v1/user/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+8801234567890",
  "address": "123 Main St, Dhaka"
}

Response:
{
  "statusCode": 201,
  "success": true,
  "message": "User created successfully!",
  "data": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+8801234567890",
    "role": "USER",
    "wallet": "64f5a1b2c3d4e5f6a7b8c9d1"
  }
}
```

#### Get All Users

```json
GET /api/v1/user/all-users?page=1&limit=10&searchTerm=john

Response:
{
  "statusCode": 200,
  "success": true,
  "message": "Users retrieved successfully!",
  "data": [
    {
      "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER",
      "isActive": "ACTIVE"
    }
  ],
  "meta": {
    "total": 1
  }
}
```

#### Get My Profile

```json
GET /api/v1/user/me

Response:
{
  "statusCode": 200,
  "success": true,
  "message": "User retrieved successfully!",
  "data": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+8801234567890",
    "role": "USER",
    "wallet": {
      "_id": "64f5a1b2c3d4e5f6a7b8c9d1",
      "walletNumber": "WALLET1234567890",
      "balance": 1500.00
    }
  }
}
```

#### Apply for Agent

```json
GET /api/v1/user/apply-for-agent

Response:
{
  "statusCode": 200,
  "success": true,
  "message": "User applied for agent successfully!",
  "data": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "agent": {
      "status": "PENDING"
    }
  }
}
```

#### Update Profile

```json
PUT /api/v1/user/update-profile
{
  "name": "John Smith",
  "phone": "+8801234567891",
  "address": "456 New St, Dhaka"
}

Response:
{
  "statusCode": 200,
  "success": true,
  "message": "User updated successfully!",
  "data": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "+8801234567891",
    "address": "456 New St, Dhaka"
  }
}
```

#### Manage Agent

```json
POST /api/v1/user/manage-agent/64f5a1b2c3d4e5f6a7b8c9d0
{
  "status": "APPROVED"
}

Response:
{
  "statusCode": 200,
  "success": true,
  "message": "Agent managed successfully!",
  "data": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "role": "AGENT",
    "agent": {
      "status": "APPROVED"
    }
  }
}
```

### Wallet Management Examples

#### Get My Wallet

```json
GET /api/v1/wallet/my-wallet

Response:
{
  "statusCode": 200,
  "success": true,
  "message": "Wallet retrieved successfully!",
  "data": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d1",
    "walletNumber": "WALLET1234567890",
    "balance": 1500.00,
    "currency": "BDT",
    "dailyLimit": 50000,
    "monthlyLimit": 500000,
    "status": "ACTIVE"
  }
}
```

#### Change Wallet PIN

```json
PATCH /api/v1/wallet/64f5a1b2c3d4e5f6a7b8c9d1/change-pin
{
  "oldPin": "1234",
  "newPin": "5678"
}

Response:
{
  "statusCode": 200,
  "success": true,
  "message": "PIN changed successfully!",
  "data": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d1",
    "walletNumber": "WALLET1234567890"
  }
}
```

#### Verify Wallet PIN

```json
POST /api/v1/wallet/64f5a1b2c3d4e5f6a7b8c9d1/verify-pin
{
  "pin": "1234"
}

Response:
{
  "statusCode": 200,
  "success": true,
  "message": "PIN verified successfully!",
  "data": {
    "verified": true
  }
}
```

#### Get Wallet Statistics

```json
GET /api/v1/wallet/64f5a1b2c3d4e5f6a7b8c9d1/stats

Response:
{
  "statusCode": 200,
  "success": true,
  "message": "Wallet stats retrieved successfully!",
  "data": {
    "totalTransactions": 25,
    "totalSent": 5000.00,
    "totalReceived": 6500.00,
    "monthlySpent": 1200.00,
    "dailySpent": 300.00
  }
}
```

#### Get Wallet by Number

```json
GET /api/v1/wallet/WALLET1234567890

Response:
{
  "statusCode": 200,
  "success": true,
  "message": "Wallet retrieved successfully!",
  "data": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d1",
    "walletNumber": "WALLET1234567890",
    "balance": 1500.00,
    "user": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

#### Get All Wallets (Admin)

```json
GET /api/v1/wallet/all-wallets?page=1&limit=10

Response:
{
  "statusCode": 200,
  "success": true,
  "message": "Wallets retrieved successfully!",
  "data": [
    {
      "_id": "64f5a1b2c3d4e5f6a7b8c9d1",
      "walletNumber": "WALLET1234567890",
      "balance": 1500.00,
      "status": "ACTIVE",
      "user": {
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "meta": {
    "total": 1
  }
}
```

#### Update Wallet Limits (Admin)

```json
PUT /api/v1/wallet/update-limits
{
  "walletId": "64f5a1b2c3d4e5f6a7b8c9d1",
  "dailyLimit": 75000,
  "monthlyLimit": 750000
}

Response:
{
  "statusCode": 200,
  "success": true,
  "message": "Wallet limits updated successfully!",
  "data": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d1",
    "dailyLimit": 75000,
    "monthlyLimit": 750000
  }
}
```

#### Update Wallet Status (Admin)

```json
PATCH /api/v1/wallet/64f5a1b2c3d4e5f6a7b8c9d1/status
{
  "status": "SUSPENDED"
}

Response:
{
  "statusCode": 200,
  "success": true,
  "message": "Wallet status updated successfully!",
  "data": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d1",
    "status": "SUSPENDED"
  }
}
```

#### Get Wallet Limits (Admin)

```json
PATCH /api/v1/wallet/64f5a1b2c3d4e5f6a7b8c9d1/limits

Response:
{
  "statusCode": 200,
  "success": true,
  "message": "Wallet limits retrieved successfully!",
  "data": {
    "dailyLimit": 50000,
    "monthlyLimit": 500000,
    "dailySpent": 1200.00,
    "monthlySpent": 15000.00
  }
}
```

### Transaction Examples

#### Money Transfer

```json
POST /api/v1/transaction/transfer
{
  "senderWalletId": "64f5a1b2c3d4e5f6a7b8c9d1",
  "receiverWalletNumber": "WALLET0987654321",
  "amount": 500,
  "pin": "1234",
  "reference": "Payment for services",
  "description": "Monthly service payment"
}

Response:
{
  "statusCode": 201,
  "success": true,
  "message": "Transfer completed successfully!",
  "data": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d2",
    "transactionId": "TXN1234567890",
    "type": "TRANSFER",
    "amount": 500,
    "fee": 5,
    "status": "COMPLETED",
    "sender": {
      "walletNumber": "WALLET1234567890"
    },
    "receiver": {
      "walletNumber": "WALLET0987654321"
    }
  }
}
```

#### Cash-Out Request

```json
POST /api/v1/transaction/cash-out
{
  "agentWalletNumber": "WALLET5555555555",
  "amount": 800,
  "pin": "1234",
  "reference": "Cash withdrawal"
}

Response:
{
  "statusCode": 201,
  "success": true,
  "message": "Cash-out completed successfully!",
  "data": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d4",
    "transactionId": "TXN1234567892",
    "type": "CASH_OUT",
    "amount": 800,
    "fee": 8,
    "status": "PENDING"
  }
}
```

#### Get My Transactions

```json
GET /api/v1/transaction/my-transactions?page=1&limit=10&type=TRANSFER

Response:
{
  "statusCode": 200,
  "success": true,
  "message": "Transactions retrieved successfully!",
  "data": [
    {
      "_id": "64f5a1b2c3d4e5f6a7b8c9d2",
      "transactionId": "TXN1234567890",
      "type": "TRANSFER",
      "amount": 500,
      "fee": 5,
      "status": "COMPLETED",
      "createdAt": "2023-09-04T10:30:00.000Z"
    }
  ],
  "meta": {
    "total": 1
  }
}
```

#### Cash-In (Agent)

```json
POST /api/v1/transaction/cash-in
{
  "userWalletNumber": "WALLET1234567890",
  "amount": 1000,
  "pin": "1234",
  "reference": "Cash deposit"
}

Response:
{
  "statusCode": 201,
  "success": true,
  "message": "Cash in completed successfully!",
  "data": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d3",
    "transactionId": "TXN1234567891",
    "type": "CASH_IN",
    "amount": 1000,
    "fee": 10,
    "commission": 5,
    "status": "COMPLETED"
  }
}
```

#### Get All Transactions (Admin)

```json
GET /api/v1/transaction/all-transactions?page=1&limit=10&type=TRANSFER

Response:
{
  "statusCode": 200,
  "success": true,
  "message": "Transactions retrieved successfully!",
  "data": [
    {
      "_id": "64f5a1b2c3d4e5f6a7b8c9d2",
      "transactionId": "TXN1234567890",
      "type": "TRANSFER",
      "amount": 500,
      "fee": 5,
      "status": "COMPLETED",
      "sender": {
        "walletNumber": "WALLET1234567890",
        "user": "John Doe"
      },
      "receiver": {
        "walletNumber": "WALLET0987654321",
        "user": "Jane Smith"
      }
    }
  ],
  "meta": {
    "total": 1
  }
}
```

#### Admin Deposit

```json
POST /api/v1/transaction/deposit
{
  "userWalletNumber": "WALLET1234567890",
  "amount": 2000,
  "reference": "Bonus credit"
}

Response:
{
  "statusCode": 201,
  "success": true,
  "message": "Deposit completed successfully!",
  "data": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d6",
    "transactionId": "TXN1234567894",
    "type": "DEPOSIT",
    "amount": 2000,
    "status": "COMPLETED"
  }
}
```

#### Transaction Refund (Admin)

```json
POST /api/v1/transaction/64f5a1b2c3d4e5f6a7b8c9d2/refund
{
  "reason": "Customer complaint resolved"
}

Response:
{
  "statusCode": 200,
  "success": true,
  "message": "Transaction refunded successfully!",
  "data": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d7",
    "transactionId": "TXN1234567895",
    "type": "REFUND",
    "amount": 500,
    "status": "COMPLETED",
    "originalTransaction": "TXN1234567890"
  }
}
```

#### Get Transaction by ID

```json
GET /api/v1/transaction/64f5a1b2c3d4e5f6a7b8c9d2

Response:
{
  "statusCode": 200,
  "success": true,
  "message": "Transaction retrieved successfully!",
  "data": {
    "_id": "64f5a1b2c3d4e5f6a7b8c9d2",
    "transactionId": "TXN1234567890",
    "type": "TRANSFER",
    "amount": 500,
    "fee": 5,
    "status": "COMPLETED",
    "sender": {
      "walletNumber": "WALLET1234567890"
    },
    "receiver": {
      "walletNumber": "WALLET0987654321"
    },
    "createdAt": "2023-09-04T10:30:00.000Z"
  }
}
```

### Error Response Format

```json
{
  "statusCode": 400,
  "success": false,
  "message": "Validation Error",
  "errorSources": [
    {
      "path": "amount",
      "message": "Amount must be at least 0.01"
    }
  ]
}
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure environment variables
4. Build the project: `npm run build`
5. Start development server: `npm run dev`

### Environment Variables

Configure the following variables in your `.env` file:

- Database connection (`DB_URL`)
- JWT secrets (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`)
- Google OAuth credentials
- Super admin credentials
- Payment gateway settings (SSL Commerz)

## Deployment

The API is configured for deployment on Vercel with the included `vercel.json` configuration file.

## License

This project is licensed under the ISC License.
