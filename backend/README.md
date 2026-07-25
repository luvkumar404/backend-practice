# File Storage Backend

A Java 17 / Spring Boot 3 REST API that stores file content in AWS S3 and metadata
in PostgreSQL.

## Architecture

```text
HTTP client -> FileController -> FileService -> S3StorageService -> AWS S3
                                      |
                                      +-> FileMetadataRepository -> PostgreSQL
```

The controller exposes DTOs only. `FileService` owns validation and metadata
transactions, while `S3StorageService` isolates AWS SDK calls. Downloads use the
S3 response stream rather than buffering the complete object in memory.

## Project structure

```text
src/main/java/com/example/filestorage
├── config/       S3 client and OpenAPI configuration
├── controller/   REST endpoints
├── dto/          API, error, and streaming response models
├── entity/       JPA FileMetadata entity
├── exception/    Domain exceptions and centralized handler
├── repository/   Spring Data JPA repository
├── service/      File workflow and S3 integration
└── FileStorageApplication.java
```

## API design

| Method | Endpoint | Result |
|---|---|---|
| POST | `/api/files/upload?userId=alice` | Upload multipart field `file` (201) |
| GET | `/api/files?page=0&size=10` | Paginated metadata |
| GET | `/api/files/{fileId}` | One metadata record |
| GET | `/api/files/{fileId}/download` | Stream original file |
| DELETE | `/api/files/{fileId}` | Delete S3 object and metadata |

The optional `userId` defaults to `anonymous`. S3 keys use
`uploads/{userId}/{uuid}-{sanitizedOriginalName}`. UUID keys make duplicate
original names safe.

## Maven dependencies

Spring Web, Spring Data JPA, Bean Validation, PostgreSQL JDBC, AWS SDK v2 S3,
Lombok, springdoc OpenAPI, JUnit 5, Mockito, MockMvc, and test-scoped H2.

## Entity

`FileMetadata` uses a UUID primary key and stores the original/stored filename,
S3 key, content type, byte size, bucket, and UTC upload instant.

## AWS configuration

`S3Config` uses the AWS SDK default credential provider chain. Locally,
environment variables are one supported source; deployed AWS workloads can use
IAM roles without static credentials.

Copy `.env.example` values into your shell/environment. Do not commit real
credentials.

## Setup

1. Install Java 17+ and PostgreSQL.
2. Create a database: `CREATE DATABASE file_storage;`
3. Create an S3 bucket and grant the runtime identity `s3:PutObject`,
   `s3:GetObject`, and `s3:DeleteObject` for `uploads/*`.
4. Set `AWS_REGION`, `AWS_S3_BUCKET_NAME`, `DB_URL`, `DB_USERNAME`, and
   `DB_PASSWORD`. Set AWS credential environment variables only for local
   development when an IAM role/profile is unavailable.
5. Run:

```bash
./mvnw spring-boot:run
```

On Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

Swagger UI is at `http://localhost:8080/swagger-ui.html`; OpenAPI JSON is at
`http://localhost:8080/api-docs`.

## Validation

The service rejects empty files, oversized files, invalid user IDs, unsafe
filenames, and unsupported content types. Initially allowed: PDF, PNG, JPEG,
TXT, and ZIP. Both Spring's multipart limit and the service-level byte limit are
configurable. Content type is checked from the multipart declaration; production
systems that accept untrusted uploads should additionally inspect file
signatures and scan for malware.

## Test

```bash
./mvnw test
```

Tests mock S3 and cover service validation, uploads, S3 failures, controller
pagination, and structured not-found responses. Import
`postman/File-Storage-API.postman_collection.json` into Postman for sample calls.
