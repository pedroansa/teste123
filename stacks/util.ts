import { GetParametersCommand, SSMClient } from "@aws-sdk/client-ssm";

import { Construct } from "constructs";
import { Stack } from "sst/constructs";
import RC4 from "simple-rc4";

async function getParameters(
  stack: Construct,
  parameters: string[]
): Promise<string[]> {
  const client = new SSMClient({
    region: Stack.of(stack).region,
  });

  const command = new GetParametersCommand({
    Names: parameters,
    WithDecryption: true,
  });

  const { Parameters, InvalidParameters } = await client.send(command);

  const ret: string[] = [];
  // eslint-disable-next-line no-restricted-syntax
  for await (const parameter of parameters) {
    const parameterResponse = Parameters?.find(
      (par) => par.Name === parameter
    )?.Value;
    ret.push(parameterResponse || "");
  }
  return ret;
}

async function getSecret(): Promise<string> {
  return process.env.RC4_KEY;
}

export async function rc4_encrypt(value) {
  const key = Buffer.from(await getSecret(), "hex").toString();
  var enc = new RC4(key);
  var msg = Buffer.from(value);
  enc.update(msg);
  return msg.toString("hex");
}
export async function rc4_decrypt(value) {
  const key = Buffer.from(await getSecret(), "hex").toString();
  var enc = new RC4(key);
  var msg = Buffer.from(value, "hex");
  enc.update(msg);
  return msg.toString();
}

export async function getDeployData(stack: Stack) {
  let cloudfrontDistributionId = "";
  let s3Arn = "";
  const parsValues = await getParameters(stack, [
    `/arq/saas/cloudfront_distribution_id`,
    `/arq/saas/s3_arn`,
  ]);
  [cloudfrontDistributionId, s3Arn] = parsValues;
  if (process.env.DISTRIBUTION_ID) {
    cloudfrontDistributionId = process.env.DISTRIBUTION_ID;
  }
  if (process.env.S3_ARN) {
    s3Arn = process.env.S3_ARN;
  }
  return {
    cloudfrontDistributionId,
    s3Arn,
  };
}