

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

NestJS Modules, Providers, and Dependency Injection
Modules
A module in NestJS is a way to organize application logic into cohesive units. It’s defined with the @Module() decorator and contains imports, providers, and exports.

Imports: Modules that your module depends on.

Providers: Classes that can be injected into other classes (e.g., services).

Exports: Providers that are made available to other modules.

Providers
A provider is a class that can be injected into other classes using NestJS’s dependency injection system.

Providers are registered in the providers array of a module.

A provider can be anything from a service to a factory or a value, but it must be registered in the module to be used.

Dependency Injection
Dependency Injection (DI) is a design pattern used to manage the dependencies of classes.

When you inject a provider into a class (e.g., a service into a controller), NestJS automatically creates and manages an instance of the provider.

DI is set up by defining the dependency in the constructor, and NestJS handles the injection.

Using Providers Across Modules
If a provider needs to be used in multiple modules, it should be exported from the module where it is defined.

Any module that needs to use the provider must import the module that exports it.

Global Modules
A global module makes its providers available throughout the entire application, without needing to import the module into every other module.

You mark a module as global by using the @Global() decorator, and you export any providers you want to make globally available.