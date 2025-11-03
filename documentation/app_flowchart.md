flowchart TD
    Start[Start] --> SignIn[User Sign In]
    SignIn --> Dashboard[Dashboard Page]
    Dashboard --> ChatInterface[Open Chat Interface]
    ChatInterface -->|User Message| APIChat[API Chat Route]
    APIChat --> AISDK[AI SDK Processing]
    AISDK --> Extract{Data Extraction Successful}
    Extract -->|Yes| SaveEvents[Save Events to DB]
    SaveEvents --> Database[PostgreSQL Database]
    Extract -->|No| StreamResponse[Stream Raw Response]
    AISDK --> StreamResponse
    StreamResponse --> ChatInterface
    Dashboard --> CalendarView[Open Calendar View]
    CalendarView --> FetchData[Fetch Events from DB]
    FetchData --> Database
    FetchData --> ShowEvents[Display Events and Metrics]
    ShowEvents --> CalendarView