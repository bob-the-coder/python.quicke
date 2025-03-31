from django.db import models


class TaskType(models.TextChoices):
    # ───────────── HIGH-LEVEL — Analysis & Planning ─────────────
    ANALYZE_REQUIREMENTS = "ANALYZE_REQUIREMENTS", "Analyze stakeholder requirements and feature requests"
    EXTRACT_CONTEXT = "EXTRACT_CONTEXT", "Extract context into a structured brief from raw input"
    DEFINE_ARCHITECTURE = "DEFINE_ARCHITECTURE", "Design high-level system or module architecture"
    SCOPE_FEATURE = "SCOPE_FEATURE", "Define what functionality is in or out of scope"
    PLAN_SPRINT = "PLAN_SPRINT", "Break down goals into sprint-sized task sets"
    PRIORITIZE_TASKS = "PRIORITIZE_TASKS", "Order tasks based on priority and dependency"
    MAP_DEPENDENCIES = "MAP_DEPENDENCIES", "Identify and describe service, code, or data dependencies"

    # ───────────── MID-LEVEL — Code Structure & Flow ─────────────
    DEFINE_MODEL = "DEFINE_MODEL", "Define a new database or data-transfer model"
    UPDATE_MODEL = "UPDATE_MODEL", "Add, remove, or change fields in an existing model"
    DB_MIGRATION = "DB_MIGRATION", "Generate or write schema migration logic"
    CREATE_ENDPOINT = "CREATE_ENDPOINT", "Implement a new API endpoint or route"
    BIND_ENDPOINT = "BIND_ENDPOINT", "Register endpoint into the routing system"
    ADD_SERIALIZER = "ADD_SERIALIZER", "Create or update serializers for structured input/output"
    INTEGRATE_MODULE = "INTEGRATE_MODULE", "Wire up a reusable module or service"
    DEFINE_VALIDATION = "DEFINE_VALIDATION", "Create field-level or object-level validation rules"
    SETUP_STATE = "SETUP_STATE", "Establish state management or context handling logic"

    # ───────────── LOW-LEVEL — Code Implementation ─────────────
    IMPLEMENT_LOGIC = "IMPLEMENT_LOGIC", "Write function/method-level business logic"
    IMPLEMENT_HELPER = "IMPLEMENT_HELPER", "Add a utility or support function"
    REFACTOR_CODE = "REFACTOR_CODE", "Improve structure or readability without changing behavior"
    REFINE_TYPES = "REFINE_TYPES", "Add or improve type annotations/interfaces"
    FIX_LINT_ERRORS = "FIX_LINT_ERRORS", "Resolve code style or formatting issues"

    # ───────────── FRONTEND — UI/UX Development ─────────────
    FRONTEND_COMPONENT = "FRONTEND_COMPONENT", "Create a UI component or container"
    FRONTEND_LOGIC = "FRONTEND_LOGIC", "Wire user interactions or UI events to logic"
    STYLE_COMPONENT = "STYLE_COMPONENT", "Style a UI component with CSS/Tailwind/etc"
    CONNECT_FRONTEND_BACKEND = "CONNECT_FRONTEND_BACKEND", "Link UI to API data sources"
    HANDLE_FORM = "HANDLE_FORM", "Implement form logic, validation, and submission"

    # ───────────── TESTING — Reliability Checks ─────────────
    WRITE_UNIT_TESTS = "WRITE_UNIT_TESTS", "Add tests for small, isolated units of logic"
    WRITE_INTEGRATION_TESTS = "WRITE_INTEGRATION_TESTS", "Test the interaction between multiple parts"
    DEFINE_FIXTURE = "DEFINE_FIXTURE", "Add test or dev data fixtures"
    DEBUG_AND_TRACE = "DEBUG_AND_TRACE", "Trace bugs and unexpected behavior"

    # ───────────── ADMIN & BACKOFFICE ─────────────
    ADMIN_UI = "ADMIN_UI", "Create or extend admin dashboard interfaces"
    CREATE_FAKE_DATA = "CREATE_FAKE_DATA", "Build seed/demo/mock data generators"

    # ───────────── DOCUMENTATION & META ─────────────
    DOCUMENT_FEATURE = "DOCUMENT_FEATURE", "Describe feature behavior and constraints"
    WRITE_TODO_FLAGS = "WRITE_TODO_FLAGS", "Mark incomplete or missing code paths"
    REVIEW_CODE = "REVIEW_CODE", "Perform manual code or behavior review"
    ADD_LOGIC = "ADD_LOGIC", "Catch-all for adding functional logic not otherwise classified"

    # ───────────── ESCAPE HATCH ─────────────
    OTHER = "OTHER", "Miscellaneous or uncategorized task"
