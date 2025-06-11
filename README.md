# MCP Server for Amazon Location Service Geocoder

<https://github.com/user-attachments/assets/d9aad071-b44c-47d4-8264-6a2cd4692ab6>

## Getting Started

### API Key

![](./doc/apikey.png)*AWS Management Console*

- API key is required.
- following scopes are required:
  - `Geocode`
  - `SearchNearby`

### MCP Server Configuration

`claude_desktop_config.json`

```json
{
 "mcpServers": {
  "geocoder": {
   "command": "npx",
   "args": ["aws-geocode-mcp"],
   "env": {
    "AMAZON_LOCATION_API_KEY": "YOUR_API_KEY", // required
    "AWS_REGION": "us-east-1" // optional, default is ap-northeast-1
   }
  }
 }
}
```
