# Design Document - Teo Deleanu(LOTR) SDK

# Initial Objectives

1. **Response Type Design:** We need to create TypeScript types that accurately represent the response data from the API. These types will make it easier for developers to understand the structure of the response data and help ensure that we correctly handle this data within our SDK.

2. **SDK Class Creation:** Develop a core SDK class that will serve as the main entry point for users of the SDK. This class should provide an intuitive interface for interacting with the LOTR API.

3. **SDK Class Testing:** Implement comprehensive end-to-end tests for the SDK class. This will help us confirm that our SDK correctly interacts with the LOTR API and handles various edge cases appropriately.

4. **Pagination Handling:** Develop functionality to handle pagination in the API's response. This will allow users of the SDK to seamlessly interact with large datasets returned by the API.

5. **Parameter Handling:** Implement a system for handling input parameters in the SDK. This should include both parameters for individual API methods and configuration parameters for the SDK itself.

6. **Authentication Handling:** Create a system for handling authentication with the API. This should include both the ability to pass an API token as a parameter when initializing the SDK and the ability to pull this token from the environment if it isn't directly provided.

7. **TypeScript Types Migration:** Migrate TypeScript types to their own folder. This will make it easier to maintain these types and allow us to package them separately so that they can be installed as `@types/teo-deleanu-sdk`.

By completing these objectives, we can provide a robust and user-friendly SDK for the LOTR API. The SDK will handle a wide range of common tasks, reducing the amount of code that users of the SDK need to write and helping them avoid common pitfalls.

## Introduction

The LOTR SDK was designed with the specific goal of simplifying and enhancing user interactions with the LOTR API. This design document aims to describe the major design decisions and explain why they benefit your organization.

## Stripe-Inspired Design

We chose a Stripe-inspired design for our SDK due to the popularity and proven efficiency of the Stripe SDK. Its structure is well-regarded in the developer community for its simplicity and intuitive design, making it an excellent template for our SDK. 

Following this model, we've designed our SDK to be easy to understand, even for developers not familiar with the LOTR API. This approach reduces the learning curve for developers and speeds up the integration process. 

## CJS and ESM Libraries

The SDK is designed to work with both CommonJS (CJS) and ECMAScript Modules (ESM), covering a wide range of JavaScript environments. This ensures the broadest possible compatibility, accommodating older projects using CJS and newer projects using ESM. 

Supporting both module systems means that regardless of your team's tech stack or the specific requirements of a project, our SDK is ready to be integrated and used without any additional module conversion work.

## Autopagination

The implementation of autopagination in the SDK allows users to seamlessly retrieve large sets of data without having to manually handle pagination. This feature improves the developer experience by abstracting the complexity of pagination and allowing developers to focus on manipulating and using the data, rather than retrieving it.

## Fetch and Node HTTP Clients

Our SDK supports both Fetch and Node HTTP clients, providing flexibility to the developers. This dual compatibility ensures that our SDK can be used in both browser-based applications (where Fetch is more commonly used) and server-side Node.js applications (where the Node HTTP client is often the better choice).

## Custom Errors

The implementation of custom errors within our SDK enhances error handling and debugging. Developers can handle different types of errors in different ways, leading to more resilient code. It also improves the developer experience by providing more informative and actionable error messages.

## Advantages Over a Simple Library

While a simple library might offer basic interactions with the LOTR API, our SDK provides a wealth of features and enhancements designed to simplify and improve the developer experience. These include the support for both CJS and ESM, autopagination, Fetch and Node HTTP clients compatibility, and custom error handling.

## Skill Demonstration

Developing this SDK showcases a number of useful skills, including:

- Deep understanding of JavaScript and its module systems.
- Understanding of good API design, as reflected in the SDK's intuitive and easy-to-use interface.
- Ability to abstract complex operations, like pagination and error handling, to improve user experience.
- Familiarity with both client-side and server-side JavaScript development, as shown by the support for Fetch and Node HTTP clients.
- Attention to detail and forward-thinking, demonstrated by the SDK's broad compatibility and custom error handling.

In conclusion, the design decisions and features of the LOTR SDK not only provide a robust and user-friendly interface to the LOTR API, but also reflect a high level of skill and understanding of modern JavaScript development practices. By choosing our SDK, you are not only choosing a superior tool, but also a team with the ability and vision to keep your tools on the cutting edge.

Since having a simple MIT license `stripe-node` library can be used and code can be modified.

Phase 1: Individual Contribution
Description: Created the project with a simple fetch request function that was capable just to handle text errors and status codes.
Entire structure of the folders and new files created from scratch:
```filepath
 - resources/Movies.ts
 - resources/Quotes.ts
 - testProject/cjs/index.js
 - test/testUtils.ts
 - types/Movie.d.ts
 - types/Quote.d.ts
 - types/Character.d.ts
 - types/index.d.ts
```
Any other class that is not listed above was ported from stripe and modified to function with LOTR.


Phase 2: Group Contribution
Description: Changing and working with other developer's code.
Modifications were added to most of the files with minimal changes or adaptations to the new scenario and API:
```filepath
- autoPagination.ts
- Error.ts
- lotr.core.ts
- lotr.cjs.node.ts
- lotr.esm.node.ts
- lotr.cjs.worker.ts
- lotr.esm.worker.ts
- ...
```



Other features that might be used and extended:
- API versioning
- Custom Cryptography
- Proxy agents
- Usage from Javascript and typescript
- Network Retries
- Timeout
- Custom HTTP agent
- Webhooks
- Application layer information


When running `yarn run lint` or `yarn run fix` there are 21 warnings that should be fixed: ```bash
✖ 21 problems (0 errors, 21 warnings)
```

PS: I've cut all possible corners to get this to the maximum level I would bring an SDK library in a weekend hackaton.
