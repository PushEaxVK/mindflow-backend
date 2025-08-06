import fs from 'fs';

// Simple function to convert YAML to JSON
// This is a basic implementation for OpenAPI YAML files
function yamlToJson(yamlContent) {
  // Remove YAML comments
  let content = yamlContent.replace(/#.*$/gm, '');
  
  // Convert YAML structure to JSON-like format
  const lines = content.split('\n');
  let json = {};
  let currentObj = json;
  let stack = [];
  let currentIndent = 0;
  
  // For simplicity, let's just copy the existing swagger.json structure
  // and update only the registration part
  return JSON.parse(fs.readFileSync('./docs/swagger.json', 'utf8'));
}

// Read the current swagger.json
const currentSwagger = JSON.parse(fs.readFileSync('./docs/swagger.json', 'utf8'));

// Update the registration schema to match our YAML
currentSwagger.components.schemas.RegisterUser = {
  "type": "object",
  "required": ["name", "email", "password"],
  "properties": {
    "name": {
      "type": "string",
      "description": "User's full name (no HTML tags allowed)",
      "example": "Maria Koval",
      "minLength": 2,
      "maxLength": 32,
      "pattern": "^[^<>]*$"
    },
    "email": {
      "type": "string",
      "format": "email",
      "description": "User's email address",
      "example": "user@example.com",
      "maxLength": 64
    },
    "password": {
      "type": "string",
      "description": "User's password (must contain both letters and numbers)",
      "example": "MyPass123!",
      "minLength": 8,
      "maxLength": 64,
      "pattern": "^(?=.*[a-zA-Z])(?=.*\\d).{8,64}$"
    }
  }
};

// Update the registration endpoint
currentSwagger.paths["/auth/register"] = {
  "post": {
    "summary": "Register a new user",
    "operationId": "registerUser",
    "tags": ["Auth"],
    "description": "Register a new user with name, email and password. Returns user data without sensitive information.",
    "security": [],
    "requestBody": {
      "required": true,
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/RegisterUser"
          },
          "examples": {
            "valid_registration": {
              "summary": "Valid registration data",
              "value": {
                "name": "Maria Koval",
                "email": "user@example.com",
                "password": "MyPass123!"
              }
            }
          }
        }
      }
    },
    "responses": {
      "201": {
        "description": "User successfully registered",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "required": ["_id", "name", "email"],
              "properties": {
                "_id": {
                  "type": "string",
                  "description": "User unique identifier",
                  "example": "507f1f77bcf86cd799439011"
                },
                "name": {
                  "type": "string",
                  "description": "User's full name",
                  "example": "Maria Koval"
                },
                "email": {
                  "type": "string",
                  "format": "email",
                  "description": "User's email address",
                  "example": "user@example.com"
                }
              }
            }
          }
        }
      },
      "400": {
        "description": "Bad request - Validation error",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "message": {
                  "type": "string",
                  "examples": [
                    "The name must be between 2 and 32 characters long",
                    "Invalid email address",
                    "Password must be between 8 and 64 characters long",
                    "Password must contain both letters and numbers"
                  ]
                }
              }
            }
          }
        }
      },
      "409": {
        "description": "Conflict - User already exists",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "message": {
                  "type": "string",
                  "example": "A user with this email already exists"
                }
              }
            }
          }
        }
      }
    }
  }
};

// Write updated JSON
fs.writeFileSync('./docs/swagger.json', JSON.stringify(currentSwagger, null, 2));

console.log('✅ Successfully updated swagger.json with registration documentation');
