"use server";

// A simple and relatively safe expression evaluator
export async function evaluateExpression(expression: string): Promise<string | null> {
  if (!expression) return null;

  try {
    let evalExpression = expression.replace(/\s/g, "");
    
    // Convert trig functions to use radians
    const toRadians = (deg: number) => deg * (Math.PI / 180);

    // Function mapping
    const funcMap: { [key: string]: string } = {
      'sqrt': 'Math.sqrt',
      'log': 'Math.log10',
      'sin': `(x) => Math.sin(${toRadians.toString()}(x))`,
      'cos': `(x) => Math.cos(${toRadians.toString()}(x))`,
      'tan': `(x) => Math.tan(${toRadians.toString()}(x))`,
      '^': '**',
    };
    
    // Replace function names and operators
    evalExpression = evalExpression.replace(/sqrt|log|sin|cos|tan|\^/g, match => funcMap[match] || match);

    // Final validation to allow only expected patterns.
    // This is not foolproof but prevents many obvious injection attacks.
    const allowedPattern = /^[0-9\.\+\-\*\/\(\)\s,Math\(\)\[\]\=>\{\}\.\*\_PI\/0-9]+$/;
    if (!allowedPattern.test(evalExpression)) {
        console.error("Invalid characters in expression:", evalExpression);
        return null;
    }
    
    const result = new Function(`'use strict'; return (${evalExpression})`)();

    if (typeof result !== 'number' || !isFinite(result)) {
      return "Error";
    }

    // Format to a reasonable number of decimal places
    return String(Number(result.toFixed(10)));
  } catch (error) {
    console.error("Evaluation error:", error);
    return "Error";
  }
}
