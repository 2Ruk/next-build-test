# Kanban Board API Spec

## Base URL

```
/api
```

## Data Models

### Board

```json
{
  "id": "string",
  "title": "string",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

### Column

```json
{
  "id": "string",
  "boardId": "string",
  "title": "string",
  "order": 0,
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

### Card

```json
{
  "id": "string",
  "columnId": "string",
  "title": "string",
  "description": "string | null",
  "order": 0,
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

---

## Endpoints

### Boards

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/boards` | 보드 목록 조회 |
| POST | `/api/boards` | 보드 생성 |
| GET | `/api/boards/:id` | 보드 상세 조회 (columns + cards 포함) |
| PATCH | `/api/boards/:id` | 보드 수정 |
| DELETE | `/api/boards/:id` | 보드 삭제 |

### Columns

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/boards/:boardId/columns` | 컬럼 생성 |
| PATCH | `/api/columns/:id` | 컬럼 수정 (title, order) |
| DELETE | `/api/columns/:id` | 컬럼 삭제 |
| PATCH | `/api/columns/reorder` | 컬럼 순서 변경 |

### Cards

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/columns/:columnId/cards` | 카드 생성 |
| PATCH | `/api/cards/:id` | 카드 수정 (title, description, order) |
| DELETE | `/api/cards/:id` | 카드 삭제 |
| PATCH | `/api/cards/:id/move` | 카드 이동 (다른 컬럼으로) |

---

## Request / Response Examples

### POST `/api/boards`

**Request:**
```json
{ "title": "My Project" }
```

**Response (201):**
```json
{
  "id": "board_1",
  "title": "My Project",
  "createdAt": "2026-05-02T06:00:00Z",
  "updatedAt": "2026-05-02T06:00:00Z"
}
```

### GET `/api/boards/:id`

**Response (200):**
```json
{
  "id": "board_1",
  "title": "My Project",
  "columns": [
    {
      "id": "col_1",
      "title": "To Do",
      "order": 0,
      "cards": [
        {
          "id": "card_1",
          "title": "Setup CI/CD",
          "description": "GitHub Actions 설정",
          "order": 0
        }
      ]
    },
    {
      "id": "col_2",
      "title": "In Progress",
      "order": 1,
      "cards": []
    },
    {
      "id": "col_3",
      "title": "Done",
      "order": 2,
      "cards": []
    }
  ]
}
```

### PATCH `/api/cards/:id/move`

**Request:**
```json
{
  "columnId": "col_2",
  "order": 0
}
```

**Response (200):**
```json
{
  "id": "card_1",
  "columnId": "col_2",
  "title": "Setup CI/CD",
  "description": "GitHub Actions 설정",
  "order": 0
}
```

### PATCH `/api/columns/reorder`

**Request:**
```json
{
  "boardId": "board_1",
  "columnIds": ["col_2", "col_1", "col_3"]
}
```

**Response (200):**
```json
{ "success": true }
```

---

## Error Response

```json
{
  "error": "Not Found",
  "message": "Board not found",
  "statusCode": 404
}
```

## Notes

- 보드 삭제 시 하위 columns, cards cascade 삭제
- order 필드로 드래그앤드롭 순서 관리
