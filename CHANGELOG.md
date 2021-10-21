# Changelog
Running changelog of releases since `2.2.3`

## 2.9.0
### Additions
 - New Paths:
    - GET /api/v1/brands
        - operation added: getBrands
    - GET & PUT /api/v1/brands/{brandId}
        - operations added: getBrand, updateBrand
    - GET /api/v1/brands/{brandId}/themes
        - operation added: getBrandThemes
    - GET & PUT /api/v1/brands/{brandId}/themes/{themeId}
        - operations added: getBrandTheme, updateBrandTheme
    - POST & DELETE /api/v1/brands/{brandId}/themes/{themeId}/logo
        - operations added: updateBrandThemeLogo, deleteBrandThemeLogo
    - POST & DELETE /api/v1/brands/{brandId}/themes/{themeId}/favicon
        - operations added: uploadBrandThemeFavicon, deleteBrandThemeFavicon
    - POST & DELETE /api/v1/brands/{brandId}/themes/{themeId}/background-image
        - operations added: uploadBrandThemeBackgroundImage, deleteBrandThemeBackgroundImage
 - Models Added:
    - Brand
    - Theme
    - Favicon
    - BackgroundImage
    - SignInPageTouchPointVariant
    - EndUserDashboardTouchPointVariant
    - ErrorPageTouchPointVariant
    - EmailTemplateTouchPointVariant
    - ImageUploadResponse

## 2.8.1
### Additions
- Adds `x-okta-operations` to the `OrgSettings` model
## 2.8.0

### Additions
- Adds `x-okta-known-values` to `IdentityProvider.Type`

## 2.3.0

## Additions

- Added missing operations and models for [Schemas API](https://developer.okta.com/docs/reference/api/schemas/).

### New Models

- UserSchema (Contains a property with special character called `$schema`)
- UserSchemaAttribute
- UserSchemaAttributeMaster
- UserSchemaAttributePermission
- UserSchemaBase
- UserSchemaBaseProperties
- UserSchemaPublic

### New Operations

- getApplicationUserSchema
- updateApplicationUserProfile
- getUserSchema
- updateUserProfile

## Bug Fixes

- Made `JsonWebKey` editable.

## v2.2.5
## Bug Fixes
- Fixed typo in README (https://github.com/okta/okta-management-openapi-spec/pull/9)
- Add private_key_jwt to OAuthEndpointAuthenticationMethod (https://github.com/okta/okta-management-openapi-spec/issues/8)
- Added FIDO FactorProvider Type (https://github.com/okta/okta-management-openapi-spec/issues/11)

## v2.2.4
### Bug Fixes
- Adds missing `spCertificate` from custom SAML application settings (#6)
- Adds missing `OpenIdConnectApplicationIdpInitiatedLogin` model (#5)
- Adds `idp_initiated_login` property (#5)

## v2.2.3
### Notes:
This release is our first release from the public repo!

### Bug Fixes
- Adds missing `method` field to `InlineHookChannelConfig`
- Adds missing `slo` field to custom SAML application settings
