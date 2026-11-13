import "@typespec/http";
import "@typespec/openapi";

using TypeSpec.Http;
using TypeSpec.OpenAPI;

@service(#{ title: "Calendar API" })
namespace Calendar;

model HealthResponse {
  status: "ok";
}

@route("/api")
interface Health {
  @get
  @route("/health")
  @operationId("getHealth")
  health(): HealthResponse;
}
