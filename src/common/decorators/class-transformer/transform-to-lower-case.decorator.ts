import { Transform, TransformFnParams } from 'class-transformer';

export function TransformToLowerCase() {
  return Transform(({ value }: TransformFnParams) =>
    transformToLowerCase(value),
  );
}

export function transformToLowerCase(value: any) {
  const transformedValue =
    typeof value === 'string' ? value.toLowerCase() : value;
  return transformedValue;
}
