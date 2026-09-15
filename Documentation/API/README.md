# TheCharity Web API

Standalone reference for the ASP.NET Core API used by the React frontend and other clients.

## Base URL

```text
https://<host>:<port>/api
```

Swagger UI is available at `https://<host>:<port>/swagger` and the OpenAPI JSON is available at `/swagger/v1/swagger.json`. The API also exposes `GET /health` outside the controller routes.

## Authentication

Protected endpoints use JWT bearer authentication:

```http
Authorization: Bearer <jwt>
```

The token is returned by `POST /api/User/login` in `ServiceResponse<string>.data`.

Authorization labels used below:

- **Public**: explicitly allows anonymous access.
- **Authenticated**: requires a valid JWT.
- **SuperAdmin**: requires the `IsSuperAdmin` policy.
- **Campaign manager**: requires permission for the referenced campaign.
- **Organization manager**: requires permission for the referenced organization.
- **Donation manager**: requires permission for the referenced donation.
- **Verify in Swagger**: the controller has no explicit authorization attribute; confirm the effective runtime behavior.

The API remains the final authorization authority. Frontend route guards and hidden buttons are only UX behavior.

## Response format

Most services return:

```json
{
	"success": true,
	"message": "Operation completed.",
	"data": {},
	"count": 0
}
```

Some endpoints return raw arrays/scalars, `204 No Content`, validation details, or provider callback objects. Handle both the status code and body.

Common statuses: `200` success, `201` created, `204` no content, `400` validation/business error, `401` unauthenticated, `403` forbidden, `404` not found, `409` conflict, and `500` server error.

## Endpoint catalog

All paths below are relative to `/api`. Values in braces are route parameters. Query parameters are shown after `?`.

### User: `/User`

```text
GET    /User                                      SuperAdmin; showDeleted optional
GET    /User/{id}                                 SuperAdmin
POST   /User/register                             Public
POST   /User/login                                Public
POST   /User/resend-confirmation                  Public
GET    /User/confirm-email?returnUrl=&email=&encodedToken=  Public
POST   /User/forgot-password                      Public
POST   /User/reset-password                       Public
PUT    /User                                      Authenticated; current-user profile
PUT    /User/change-password                      Authenticated
DELETE /User/{id}                                 SuperAdmin
GET    /User/restore/{id}                         SuperAdmin
POST   /User/{userId}/roles                       SuperAdmin
DELETE /User/{userId}/roles/{role}                SuperAdmin
GET    /User/{userId}/roles                       SuperAdmin
GET    /User/roles/all                            SuperAdmin
POST   /User/seed-superadmin                      SuperAdmin
```

### External login: `/ExternalLogin`

```text
GET /ExternalLogin/external-login?provider=&returnUrl=                    Provider challenge
GET /ExternalLogin/external-login-callback?returnUrl=&remoteError=         Public callback
```

The callback redirects to a configured trusted frontend URL and appends `?token=<jwt>`.

### Campaign: `/Campaign`

```text
GET    /Campaign                                      Public; includeDeleted optional
GET    /Campaign/{id}                                 Public
GET    /Campaign/{id}/details                         Public
PUT    /Campaign/{id}                                 Campaign manager
DELETE /Campaign/{id}                                 Campaign manager
PATCH  /Campaign/{id}/restore                         SuperAdmin
GET    /Campaign/expiring-soon?daysThreshold=          Public
GET    /Campaign/expired                              Public
PATCH  /Campaign/{id}/extend-deadline?newDeadline=     Campaign manager
POST   /Campaign/auto-expire                          SuperAdmin
GET    /Campaign/solo                                 Public; includeDeleted optional
GET    /Campaign/solo/{id}                            Public
POST   /Campaign/solo                                 Campaign creation permission
PUT    /Campaign/solo/{id}                            Campaign manager
GET    /Campaign/solo/by-organization/{organizationId} Public
GET    /Campaign/shared                               Public; includeDeleted optional
GET    /Campaign/shared/{id}                          Public
POST   /Campaign/shared                               Campaign creation permission
PUT    /Campaign/shared/{id}                          Campaign manager
GET    /Campaign/shared/by-organization/{organizationId} Public
POST   /Campaign/shared/{sharedCampaignId}/add-organization/{organizationId} Campaign manager
DELETE /Campaign/shared/{sharedCampaignId}/remove-organization/{organizationId} Campaign manager
GET    /Campaign/shared/{sharedCampaignId}/organization-count Public
PATCH  /Campaign/{campaignId}/money                   Campaign manager
PATCH  /Campaign/{campaignId}/increment-money         Campaign manager
PATCH  /Campaign/{campaignId}/status?status=           Campaign manager
GET    /Campaign/filter/by-status?status=              Public
GET    /Campaign/filter/by-type?type=                  Public
GET    /Campaign/active                               Public
GET    /Campaign/search?term=                          Public
GET    /Campaign/deleted                             SuperAdmin
GET    /Campaign/solo/by-status?status=                Public
GET    /Campaign/shared/by-status?status=              Public
GET    /Campaign/filter/by-target-range?minTarget=&maxTarget= Public
GET    /Campaign/filter/by-achievement?minPercentage=  Public
GET    /Campaign/ending-soon?remainingValue=           Public
GET    /Campaign/statistics/total-count?includeDeleted= Public
GET    /Campaign/statistics/active-count              Public
GET    /Campaign/statistics/solo-count                Public
GET    /Campaign/statistics/shared-count              Public
GET    /Campaign/statistics/total-money               Public
GET    /Campaign/statistics/average-achievement       Public
GET    /Campaign/statistics/count-by-type             Public
GET    /Campaign/statistics/count-by-status            Public
GET    /Campaign/statistics/dashboard                 Public
GET    /Campaign/trending/top-by-achievement          Public
GET    /Campaign/trending/top-by-donations            Public
GET    /Campaign/trending/recent                      Public
GET    /Campaign/trending/urgent                      Public
PATCH  /Campaign/bulk/update-status                   SuperAdmin
DELETE /Campaign/bulk/delete-expired                  SuperAdmin
GET    /Campaign/options/statuses                     Public
GET    /Campaign/options/types                        Public
```

### Organization: `/Organization`

```text
GET    /Organization                                Public; includeDeleted optional
GET    /Organization/{orgId}                        Public
GET    /Organization/{orgId}/details                Public
POST   /Organization                                SuperAdmin
PUT    /Organization/{orgId}                        SuperAdmin
DELETE /Organization/{orgId}                        SuperAdmin
PATCH  /Organization/{orgId}/restore                SuperAdmin
GET    /Organization/deleted                        SuperAdmin
GET    /Organization/dropdown                       Public
GET    /Organization/search?term=                   Public
GET    /Organization/filter/by-name?name=            Public
GET    /Organization/filter/by-address?address=      Public
GET    /Organization/recent?days=                   Public
GET    /Organization/count/total                    Public
GET    /Organization/count/active                   Public
GET    /Organization/{orgId}/contact-methods        Public
GET    /Organization/contact-methods/{contactId}    Public
POST   /Organization/contact-methods                Organization manager
PUT    /Organization/contact-methods/{contactId}    Organization manager
DELETE /Organization/contact-methods/{contactId}    Organization manager
GET    /Organization/contact-methods/restore/{contactId} Organization manager
GET    /Organization/{orgId}/contact-type?type=     Public
GET    /Organization/{orgId}/contact-type/count?type= Public
GET    /Organization/contact-type/{type}            Public
GET    /Organization/payment/none                  Public
GET    /Organization/payment/valid                 Public
GET    /Organization/payment/last-update            Public
GET    /Organization/campaigns/min-count?minCampaigns= Public
GET    /Organization/campaigns/active               Public
GET    /Organization/campaigns/completed            Public
GET    /Organization/campaigns/none                 Public
POST   /Organization/{orgId}/admin                  Organization manager
DELETE /Organization/{orgId}/admin                  Organization manager
POST   /Organization/{orgId}/admin/transfer         Organization manager
GET    /Organization/{orgId}/admin                  Organization manager
POST   /Organization/{orgId}/sub-admins             Organization manager
DELETE /Organization/{orgId}/sub-admins/{userId}    Organization manager
GET    /Organization/{orgId}/sub-admins             Organization manager
GET    /Organization/{orgId}/sub-admins/{userId}/check Organization manager
```

Commented-out legacy organization payment actions are not active endpoints.

### Organization roles: `/OrganizationRole`

```text
GET    /OrganizationRole                                             SuperAdmin; QueryParameters
POST   /OrganizationRole                                             SuperAdmin
PUT    /OrganizationRole/{organizationId}/organizations/{userId}/users SuperAdmin
GET    /OrganizationRole/{organizationId}/organizations/{userId}/users SuperAdmin
DELETE /OrganizationRole/{organizationId}/organizations/{userId}/users SuperAdmin
```

### Donations: `/Donations`

```text
GET    /Donations                                SuperAdmin; includeDeleted optional
GET    /Donations/{id}                           Donation manager
GET    /Donations/{id}/details                   Donation manager
POST   /Donations                                Donation creation permission; CampaignId required
PUT    /Donations/{id}                           Donation manager
DELETE /Donations/{id}                           Donation manager
PATCH  /Donations/{id}/restore                   Donation manager
GET    /Donations/deleted                        SuperAdmin
GET    /Donations/recent?days=                   SuperAdmin
GET    /Donations/by-user/{userId}               SuperAdmin
GET    /Donations/by-campaign/{campaignId}       Campaign manager
GET    /Donations/by-amount-range?min=&max=       SuperAdmin
GET    /Donations/by-date-range?startDate=&endDate= SuperAdmin
GET    /Donations/search?userId=&campaignId=      Campaign manager
GET    /Donations/by-amount-and-date?minAmount=&startDate= SuperAdmin
POST   /Donations/by-users                      SuperAdmin; string array body
POST   /Donations/by-campaigns                  SuperAdmin; integer array body
GET    /Donations/stats/total-amount            SuperAdmin
GET    /Donations/stats/total-count             SuperAdmin
GET    /Donations/stats/total-amount/by-user/{userId} SuperAdmin
GET    /Donations/stats/total-amount/by-campaign/{campaignId} Campaign manager
GET    /Donations/stats/count/by-user/{userId}  SuperAdmin
GET    /Donations/stats/count/by-campaign/{campaignId} Campaign manager
GET    /Donations/analytics/average             SuperAdmin
GET    /Donations/analytics/average/by-user/{userId} SuperAdmin
GET    /Donations/analytics/average/by-campaign/{campaignId} SuperAdmin
GET    /Donations/analytics/top-donors?limit=     SuperAdmin
GET    /Donations/analytics/top-campaigns?limit= SuperAdmin
GET    /Donations/analytics/trend?days=           SuperAdmin
GET    /Donations/analytics/frequency-by-user     SuperAdmin
GET    /Donations/dashboard/latest?limit=         SuperAdmin
GET    /Donations/dashboard/largest?limit=        SuperAdmin
GET    /Donations/dashboard/per-campaign-count   SuperAdmin
GET    /Donations/dashboard/per-user-count       SuperAdmin
GET    /Donations/dashboard/today-total           SuperAdmin
GET    /Donations/dashboard/week-total            SuperAdmin
GET    /Donations/dashboard/month-total           SuperAdmin
GET    /Donations/reports/monthly?year=           SuperAdmin
GET    /Donations/reports/quarterly?year=         SuperAdmin
GET    /Donations/reports/yearly?yearsBack=       SuperAdmin
GET    /Donations/reports/by-time-of-day          SuperAdmin
GET    /Donations/reports/by-day-of-week          SuperAdmin
GET    /Donations/reports/record-count?startDate=&endDate= SuperAdmin
GET    /Donations/campaigns/{campaignId}/total-raised Campaign manager
GET    /Donations/campaigns/{campaignId}/progress Campaign manager
GET    /Donations/campaigns/{campaignId}/donors   Campaign manager
GET    /Donations/campaigns/{campaignId}/timeline Campaign manager
GET    /Donations/users/{userId}/history          SuperAdmin
GET    /Donations/users/{userId}/last-donation-date SuperAdmin
GET    /Donations/users/{userId}/campaigns        SuperAdmin
POST   /Donations/bulk/transfer                   SuperAdmin
DELETE /Donations/bulk/old                       SuperAdmin
GET    /Donations/{id}/exists                     Authenticated
GET    /Donations/check-donated?userId=&campaignId= Authenticated
GET    /Donations/engagement/recurring           SuperAdmin
GET    /Donations/engagement/first-time          SuperAdmin
GET    /Donations/engagement/lifetime-value      SuperAdmin
GET    /Donations/engagement/loyal               SuperAdmin
GET    /Donations/audit/suspicious               SuperAdmin
```

### Donated items: `/DonatedItem`

Important: `DonatedItemController` currently has the ASP.NET Core `[NonController]` attribute. Unless it is registered by another mechanism, MVC will not discover these actions and they will not appear in Swagger. Remove `[NonController]` or register the endpoints explicitly before using them from the frontend.

```text
GET    /DonatedItem                                      Verify in Swagger; includeDeleted optional
GET    /DonatedItem/{itemId}                             Verify in Swagger
POST   /DonatedItem                                      CreateDonatedItemDto
PUT    /DonatedItem/{itemId}                             UpdateDonatedItemDto
DELETE /DonatedItem/{itemId}
PATCH  /DonatedItem/{itemId}/restore
GET    /DonatedItem/filter/organization/{organizationId}
GET    /DonatedItem/filter/donor/{donorId}
GET    /DonatedItem/filter/category?category=
GET    /DonatedItem/filter/available
GET    /DonatedItem/filter/unavailable
GET    /DonatedItem/filter/deleted
GET    /DonatedItem/search?searchTerm=
GET    /DonatedItem/image/{itemId}
GET    /DonatedItem/{imageId}/image
POST   /DonatedItem/image                               multipart/form-data; CreateItemImageDto
DELETE /DonatedItem/image/{imageId}
GET    /DonatedItem/image/{itemId}/count
GET    /DonatedItem/image/{itemId}/primary
GET    /DonatedItem/attachment/{itemId}/all
GET    /DonatedItem/attachment/{itemId}
GET    /DonatedItem/attachment/{itemId}/recipient
GET    /DonatedItem/{attachmentId}/attachment
POST   /DonatedItem/attachment                         multipart/form-data; CreateAttachmentDto
DELETE /DonatedItem/attachment/{id}
PATCH  /DonatedItem/{itemId}/availability?isAvailable=
PATCH  /DonatedItem/{itemId}/available
PATCH  /DonatedItem/{itemId}/unavailable
PATCH  /DonatedItem/{itemId}/category?category=
GET    /DonatedItem/count
GET    /DonatedItem/availabl/count                     Current route spelling
GET    /DonatedItem/organization/{organizationId}/count
GET    /DonatedItem/donor/{donorId}/count
GET    /DonatedItem/category/count?category=
GET    /DonatedItem/categories/count/all
GET    /DonatedItem/top-donors?top=
GET    /DonatedItem/top-organization/donation?top=
GET    /DonatedItem/items/recent?days=
GET    /DonatedItem/items/without-images
GET    /DonatedItem/items/with-attachments
GET    /DonatedItem/items/date-range?startDate=&endDate=
PATCH  /DonatedItem/bulk/category?oldCategory=&newCategory=
PATCH  /DonatedItem/bulk/unavailable?organizationId=
DELETE /DonatedItem/delete-old?daysOld=
GET    /DonatedItem/{itemId}/with-images
GET    /DonatedItem/{itemId}/with-attachments
GET    /DonatedItem/{itemId}/details
GET    /DonatedItem/recent/limit?limit=
GET    /DonatedItem/trend?days=
GET    /DonatedItem/donor/{donorId}/history
GET    /DonatedItem/donor/count/{donorId}
GET    /DonatedItem/donor/{donorId}/favorite-category
GET    /DonatedItem/organization/{organizationId}/inventory
GET    /DonatedItem/organization/{organizationId}/available-count
GET    /DonatedItem/organization/{organizationId}/inventory-by-category
GET    /DonatedItem/{itemId}/storage
GET    /DonatedItem/storage/total
GET    /DonatedItem/attachments/large
POST   /DonatedItem/categories/multiple
GET    /DonatedItem/categories/distribution
GET    /DonatedItem/categories/popular
GET    /DonatedItem/search/category?searchTerm=
GET    /DonatedItem/organization/{organizationId}/category?category=
GET    /DonatedItem/donor/{donorId}/date-range?startDate=&endDate=
PATCH  /DonatedItem/{itemId}/transfer
PATCH  /DonatedItem/{itemId}/donor
GET    /DonatedItem/recently-updated
GET    /DonatedItem/activity/donors
```

### Payment: `/Payment`

```text
POST /Payment/create                         Authenticated; CreatePaymentRequestDto
POST /Payment/callback?hmac=                 Public Paymob callback; PaymobCallbackWrapper
```

`/Payment/create` returns a payment iframe URL in `ServiceResponse<string>.data`. The callback verifies the HMAC and intentionally returns HTTP 200 after processing starts because Paymob retries non-200 responses.

### Payment information: `/PaymentInfo`

```text
GET    /PaymentInfo/by-organization/{organizationId} Payment-info permission
GET    /PaymentInfo/{paymentInfoId}                 Payment-info permission
POST   /PaymentInfo                                  CreatePaymentInfoDto; permission
PUT    /PaymentInfo/{paymentInfoId}                  UpdatePaymentInfoDto; permission
DELETE /PaymentInfo/{paymentInfoId}                  Payment-info permission
GET    /PaymentInfo/restore/{paymentInfoId}          Payment-info permission
GET    /PaymentInfo/has/{organizationId}             Payment-info permission
GET    /PaymentInfo/validate/{organizationId}       Payment-info permission
```

## Main request DTOs

Exact schemas are available in Swagger and the C# DTO definitions. The following are the main frontend request models:

| DTO | Main fields or use |
|---|---|
| `LoginRequestDto` | `UserName`, `Password`, `RememberMe` |
| `CreateUserRequestDto` | `UserName`, `FullName`, `Email`, `PhoneNumber`, `Address`, `Password`, `ConfirmPassword`, `returnUrl` |
| `ResendEmailConfirmRequest` | `Email`, `returnUrl` |
| `ForgetPasswordRequestDto` | Password-reset email request |
| `ResetPasswordRequestDto` | Password-reset token and new password |
| `EditUserRequestDto` | Current-user profile update |
| `ChangePasswordRequestDto` | Current and new password values |
| `CreateDonationDto` | Donation amount, user, and campaign identifiers |
| `CreatePaymentRequestDto` | Amount, campaign identifier, and organization identifier |
| `CreatePaymentInfoDto` | Organization payment configuration |
| `UpdatePaymentInfoDto` | Updated organization payment configuration |
| `CreateItemImageDto` | Multipart donated-item image upload |
| `CreateAttachmentDto` | Multipart donated-item attachment upload |
| `QueryParameters` | Organization-role filtering and paging |

Use `multipart/form-data` for image and attachment creation. Do not send those requests as JSON.

## Enums and query values

JSON serialization is configured to represent enums as strings. Campaign and donated-item filters therefore normally use enum names such as `status=...`, `type=...`, and `category=...`. Confirm exact values in Swagger or use the campaign options endpoints.

## CORS and React configuration

The CORS policy is named `AllowAngular` for historical reasons and reads origins from `AllowedFrontends`. Add the React development origin to API configuration, for example:

```json
{
	"AllowedFrontends": ["http://localhost:5173"]
}
```

The React app can use:

```text
VITE_API_BASE_URL=https://localhost:<api-port>/api
```

## Source of truth

This document is based on the active route attributes in `TheCharityPL/Controllers`. When a controller route, DTO, authorization policy, or response contract changes, update this document and recheck `/swagger/v1/swagger.json`. Commented-out controller actions are not active endpoints.
