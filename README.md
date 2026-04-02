## Structure + production patterns.

### Tech:
```bash
Node.js
Express
PostgreSQL (pg)
JWT
bcrypt
```
### 1. Project Structure
```bash
pos-backend
│
├── src
│
│   ├── config
│   │   ├── db.js
│   │   └── env.js
│
│   ├── controllers
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── salesController.js
│   │   ├── purchaseController.js
│   │   ├── inventoryController.js
│   │   ├── partyController.js
│   │   └── reportController.js
│
│   ├── services
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── salesService.js
│   │   ├── purchaseService.js
│   │   ├── inventoryService.js
│   │   ├── partyService.js
│   │   └── reportService.js
│
│   ├── repositories
│   │   ├── userRepository.js
│   │   ├── productRepository.js
│   │   ├── salesRepository.js
│   │   ├── purchaseRepository.js
│   │   ├── inventoryRepository.js
│   │   ├── partyRepository.js
│   │   └── reportRepository.js
│
│   ├── routes
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── salesRoutes.js
│   │   ├── purchaseRoutes.js
│   │   ├── inventoryRoutes.js
│   │   ├── partyRoutes.js
│   │   └── reportRoutes.js
│
│   ├── middleware
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   └── errorMiddleware.js
│
│   ├── utils
│   │   ├── ApiError.js
│   │   └── logger.js
│
│   ├── app.js
│   └── server.js
│
├── package.json
└── .env 
```
# ___.UI
