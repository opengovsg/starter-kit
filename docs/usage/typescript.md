# TypeScript

Whether you're a new or seasoned developer, we think that TypeScript is a must have. It can look intimidating at first, but much like a lot of tools, is something that many never look back from after starting to use it.

It provides live feedback as you write your code by defining expected data types, and either provides helpful autocomplete in your code editor, or yells at you with red squiggly lines if you're trying to access a property that doesn't exist or trying to pass a value of the wrong type, which you would otherwise have to debug further down the line.

It is, perhaps, the tool that provides the most productivity to developers; providing documentation of the code you're writing or consuming directly in your editor, and having instant feedback as you inevitably make mistakes is absolutely priceless.

## Type Inference

While many new TypeScript developers are concerned with _writing_ TypeScript, many of its benefits don't actually require you to change your code at all, in particular inference. Inference means that if something is typed, that type will follow it throughout the flow of the application without having to be re-declared in other places. This means that for example once you have defined the types of the arguments that a function takes, the remainder of the function will usually be typesafe without requiring any further TypeScript-specific code. Library developers put a ton of work into maintaining the types for their libraries, which means that we as application developers can benefit from both the inference and the built-in documentation in your code editor that these types provide.

## Powerful uses of type inference

### Zod

[Zod](https://github.com/colinhacks/zod) is a schema validation library that is built on top of TypeScript. Write a schema that represents a single source of truth for your data, and Zod will ensure that your data is valid throughout your application, even across network boundaries and external APIs.

### Tanstack Query

[Tanstack Query](https://tanstack.com/query/latest/) gives you declarative, always-up-to-date auto-managed queries and mutations that directly improve both your developer and user experiences.

## Useful Resources

| Resource                                                  | Link                                                              |
| --------------------------------------------------------- | ----------------------------------------------------------------- |
| TypeScript Handbook                                       | https://www.typescriptlang.org/docs/handbook/                     |
| Beginners TypeScript Tutorial                             | https://github.com/total-typescript/beginners-typescript-tutorial |
| Type Challenges                                           | https://github.com/type-challenges/type-challenges                |
| Rodney Mullen of TypeScript (Matt Pocock) Youtube Channel | https://www.youtube.com/c/MattPocockUk/videos                     |
