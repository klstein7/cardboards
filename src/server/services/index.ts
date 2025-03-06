/**
 * Service Layer Architecture
 *
 * This module exports all service instances for the application.
 * Services follow a consistent pattern using a class-based approach with:
 *
 * 1. BaseService: A common base class with transaction handling and utility methods
 * 2. Strong typing for all parameters
 * 3. Consistent error handling
 * 4. Transaction support throughout all methods
 * 5. Clear documentation
 *
 * When creating new services, extend the BaseService class and follow
 * the established patterns for consistency.
 */

export * from "./analytics.service";
export * from "./auth.service";
export * from "./base.service";
export * from "./board.service";
export * from "./card.service";
export * from "./card-comment.service";
export * from "./column.service";
export * from "./history.service";
export * from "./invitation.service";
export * from "./project.service";
export * from "./project-user.service";
export * from "./user.service";
