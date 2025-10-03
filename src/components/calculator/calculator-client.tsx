"use client";

import { useState, useTransition } from "react";
import {
  History,
  Lightbulb,
  Plus,
  Minus,
  X,
  Divide,
  Percent,
  SquareDot,
  Superscript,
  BrainCircuit,
  Eraser,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { evaluateExpression } from "@/lib/evaluator";
import { explainCalculation } from "@/ai/flows/explain-calculation";
import { correctCalculation } from "@/ai/flows/correct-calculation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type HistoryItem = {
  expression: string;
  result: string;
};

export function CalculatorClient() {
  const [displayValue, setDisplayValue] = useState("0");
  const [expression, setExpression] = useState("");
  const [isResult, setIsResult] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [explanation, setExplanation] = useState("");
  const [isAiLoading, startAiTransition] = useTransition();
  const [correctionInput, setCorrectionInput] = useState("");
  const { toast } = useToast();

  const handleButtonClick = async (value: string, type: string) => {
    if (isResult && type !== "operator" && type !== "special" && value !== "=") {
      setDisplayValue(value === "." ? "0." : value);
      setExpression(value === "." ? "0." : value);
      setIsResult(false);
      return;
    }
    
    setIsResult(false);

    switch (type) {
      case "number":
      case "function":
      case "paren":
        if (displayValue === "0" && value !== ".") {
          setDisplayValue(value);
          setExpression(prev => prev + value);
        } else {
          setDisplayValue(prev => prev + value);
          setExpression(prev => prev + value);
        }
        break;
      
      case "operator":
        setExpression(prev => prev + value);
        setDisplayValue(value);
        break;
      
      case "decimal":
        if (!displayValue.includes(".")) {
          setDisplayValue(prev => prev + ".");
          setExpression(prev => prev + ".");
        }
        break;

      case "clear":
        setDisplayValue("0");
        setExpression("");
        break;
      
      case "backspace":
        if (expression.length > 0) {
          const newExpression = expression.slice(0, -1);
          setExpression(newExpression);
          // A bit simplistic, but updates display reasonably.
          const parts = newExpression.split(/[\+\-\*\/]/);
          setDisplayValue(parts[parts.length-1] || "0");
        }
        break;

      case "equals":
        if (expression) {
          const result = await evaluateExpression(expression);
          if (result !== null) {
            setDisplayValue(result);
            setHistory(prev => [{ expression, result }, ...prev].slice(0, 20));
            setExpression(result);
            setIsResult(true);
          } else {
            toast({
              title: "Invalid Expression",
              description: "Please check your calculation.",
              variant: "destructive",
            });
          }
        }
        break;
    }
  };

  const handleExplain = () => {
    if (!isResult) return;
    startAiTransition(async () => {
      const { explanation } = await explainCalculation({ calculation: `${history[0].expression} = ${history[0].result}` });
      setExplanation(explanation);
    });
  };
  
  const handleCorrection = () => {
    startAiTransition(async () => {
      const originalInput = "twenty five divided by five plus two"; // Example misheard input
      const { calculation } = await correctCalculation({ originalInput, correctedInput: correctionInput });
      setExpression(calculation);
      setDisplayValue(calculation);
      setCorrectionInput("");
    });
  };

  const buttons = [
    { value: "C", type: "clear", className: "bg-secondary hover:bg-secondary/80", label: "C" },
    { value: "(", type: "paren", className: "bg-muted hover:bg-muted/80", label: "(" },
    { value: ")", type: "paren", className: "bg-muted hover:bg-muted/80", label: ")" },
    { value: "/", type: "operator", icon: Divide, className: "bg-primary hover:bg-primary/90" },
    { value: "sin(", type: "function", label: "sin" },
    { value: "7", type: "number", label: "7" },
    { value: "8", type: "number", label: "8" },
    { value: "9", type: "number", label: "9" },
    { value: "*", type: "operator", icon: X, className: "bg-primary hover:bg-primary/90" },
    { value: "cos(", type: "function", label: "cos" },
    { value: "4", type: "number", label: "4" },
    { value: "5", type: "number", label: "5" },
    { value: "6", type: "number", label: "6" },
    { value: "-", type: "operator", icon: Minus, className: "bg-primary hover:bg-primary/90" },
    { value: "tan(", type: "function", label: "tan" },
    { value: "1", type: "number", label: "1" },
    { value: "2", type: "number", label: "2" },
    { value: "3", type: "number", label: "3" },
    { value: "+", type: "operator", icon: Plus, className: "bg-primary hover:bg-primary/90" },
    { value: "log(", type: "function", label: "log" },
    { value: "^", type: "operator", icon: Superscript },
    { value: "0", type: "number", label: "0" },
    { value: ".", type: "decimal", label: "." },
    { value: "=", type: "equals", className: "bg-primary hover:bg-primary/90", label: "=" },
    { value: "sqrt(", type: "function", icon: SquareDot },
  ];

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-foreground/80 font-headline">MotionCalc</h1>
            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon"><BrainCircuit className="w-5 h-5"/></Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>AI Correction Demo</DialogTitle>
                    <DialogDescription>
                      Simulate correcting a misheard voice input.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Original (misheard): <span className="text-foreground">"twenty five divided by five plus two"</span></p>
                    <div>
                      <Label htmlFor="correction">Your Correction</Label>
                      <Input id="correction" placeholder="e.g., 25 / 5 + 2" value={correctionInput} onChange={(e) => setCorrectionInput(e.target.value)} />
                    </div>
                    <Button onClick={handleCorrection} disabled={isAiLoading}>{isAiLoading ? "Correcting..." : "Let AI Correct"}</Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon"><History className="w-5 h-5"/></Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader><SheetTitle>Calculation History</SheetTitle></SheetHeader>
                  <div className="mt-4 space-y-4">
                    {history.length === 0 ? <p className="text-muted-foreground">No history yet.</p> : 
                      history.map((item, index) => (
                        <div key={index} className="p-2 rounded-md bg-muted/50 cursor-pointer hover:bg-muted" onClick={() => { setExpression(item.expression); setDisplayValue(item.expression); }}>
                          <p className="text-xs text-muted-foreground break-all">{item.expression}</p>
                          <p className="text-lg font-semibold break-all">= {item.result}</p>
                        </div>
                      ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
        </div>
        
        {/* Display */}
        <div className="bg-muted/50 rounded-lg p-4 text-right mb-4 min-h-[100px] flex flex-col justify-end">
          <p className="text-muted-foreground text-lg break-all">{expression || " "}</p>
          <div className="flex items-center justify-end gap-2">
            {isResult && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="-ml-4" onClick={handleExplain} disabled={isAiLoading}><Lightbulb className="w-5 h-5 text-primary"/></Button>
              </DialogTrigger>
              <DialogContent>
                 <DialogHeader><DialogTitle>AI Explanation</DialogTitle></DialogHeader>
                 {isAiLoading ? <p>Loading explanation...</p> : <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: explanation.replace(/\n/g, '<br />') }}></div>}
              </DialogContent>
            </Dialog>
            )}
            <h2 className="text-5xl font-semibold text-foreground break-all transition-all duration-300">{displayValue}</h2>
          </div>
        </div>
        
        {/* Keypad */}
        <div className="grid grid-cols-5 gap-2">
          {buttons.map((btn) => (
            <Button
              key={btn.value}
              variant="outline"
              className={`h-16 text-xl transition-transform duration-100 active:scale-95 ${btn.className || ''}`}
              onClick={() => handleButtonClick(btn.value, btn.type)}
            >
              {btn.icon ? <btn.icon /> : btn.label}
            </Button>
          ))}
          <Button
              variant="outline"
              className="h-16 text-xl transition-transform duration-100 active:scale-95 bg-secondary hover:bg-secondary/80"
              onClick={() => handleButtonClick('', 'backspace')}
            >
              <Eraser />
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
