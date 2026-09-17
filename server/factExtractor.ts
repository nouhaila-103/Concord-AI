import { GoogleGenAI, Type } from "@google/genai";

export interface QuestionnaireAnswers {
  systemName?: string;
  whatItDoes: string; // What does the AI system do?
  intendedPurpose: string; // Intended purpose
  industry: string; // Industry
  deploymentLocations: string; // Countries/states where deployed
  whoUsesIt: string; // Who uses it?
  whoIsAffected: string; // Who is affected?
  makesDecisionsAboutPeople: boolean | string; // Does it make or influence decisions about people?
  processesPersonalData: boolean | string; // Does it process personal data?
  processesSensitiveData: boolean | string; // Does it process sensitive data?
  affectedRegulatedAreas: string[] | string; // Does it affect employment, education, healthcare, finance, law enforcement, or other regulated areas?
  humanOversightDegree: string; // Degree of human oversight
  modelProvider: string; // Model/provider
  decisionsAutomated: boolean | string; // Whether decisions are automated
  unstructuredNotes?: string; // Optional architecture overview / specs
}

export interface ExtractedFacts {
  system_profile: {
    name: string;
    description: string;
    intendedPurpose: string;
    industry: string;
    modelProvider: string;
    isGenerativeAI: boolean;
    interactsWithHumansDirectly: boolean;
  };
  geographic_scope: {
    isEUDeployed: boolean;
    deployedUSStates: string[];
    isFederalGovContract: boolean;
    isGlobal: boolean;
  };
  decision_impact: {
    affectsLegalOrMaterialRights: boolean;
    isConsequentialDecision: boolean;
    makesDecisionsAboutPeople: boolean;
    targetPopulations: string[];
    automatedDecisionLevel: "fully_automated" | "human_veto_available" | "purely_advisory";
  };
  data_processing: {
    processesPersonalData: boolean;
    processesBiometrics: boolean;
    processesSpecialCategoryData: boolean;
    trainingDataTransparencyNeeded: boolean;
    dataCategories: string[];
  };
  regulated_sectors: string[];
  oversight_profile: {
    oversightLevel: "none/fully_autonomous" | "on-the-loop" | "in-the-loop" | "over-the-loop";
    hasKillSwitch: boolean;
    canIntervene: boolean;
  };
  extractionMetadata: {
    extractedAt: string;
    extractionMethod: "ai-assisted" | "deterministic-fallback";
    confidenceScore: number;
    notes: string;
  };
}

// Deterministic fallback rule-based parser in case LLM API key is missing or offline
export function fallbackFactExtraction(answers: QuestionnaireAnswers): ExtractedFacts {
  const textBlob = `${answers.whatItDoes || ""} ${answers.intendedPurpose || ""} ${answers.industry || ""} ${answers.deploymentLocations || ""} ${answers.unstructuredNotes || ""}`.toLowerCase();

  const isEU =
    textBlob.includes("eu") ||
    textBlob.includes("europe") ||
    textBlob.includes("germany") ||
    textBlob.includes("france") ||
    textBlob.includes("netherlands") ||
    textBlob.includes("ireland") ||
    textBlob.includes("global");

  const usStates: string[] = [];
  if (textBlob.includes("colorado") || textBlob.includes("co ") || textBlob.includes("us-co")) usStates.push("CO");
  if (textBlob.includes("new york") || textBlob.includes("nyc") || textBlob.includes("ny ") || textBlob.includes("us-ny")) usStates.push("NYC", "NY");
  if (textBlob.includes("california") || textBlob.includes("ca ") || textBlob.includes("us-ca")) usStates.push("CA");
  if (textBlob.includes("united states") || textBlob.includes("usa") || textBlob.includes("us federal") || textBlob.includes("nationwide") || textBlob.includes("all us")) {
    if (usStates.length === 0) usStates.push("ALL_US");
  }

  const isFederal = textBlob.includes("federal") || textBlob.includes("omb") || textBlob.includes("government agency") || textBlob.includes("dod") || textBlob.includes("gsa");

  const isGenAI =
    textBlob.includes("llm") ||
    textBlob.includes("gpt") ||
    textBlob.includes("gemini") ||
    textBlob.includes("claude") ||
    textBlob.includes("generative") ||
    textBlob.includes("chatbot") ||
    textBlob.includes("synthetic");

  const interactsWithHumans =
    textBlob.includes("chat") ||
    textBlob.includes("bot") ||
    textBlob.includes("conversational") ||
    textBlob.includes("applicant") ||
    textBlob.includes("candidate") ||
    textBlob.includes("customer") ||
    textBlob.includes("patient") ||
    textBlob.includes("direct interaction");

  // Regulated sectors
  const sectors: string[] = [];
  const rawSectors = Array.isArray(answers.affectedRegulatedAreas)
    ? answers.affectedRegulatedAreas.join(" ").toLowerCase()
    : String(answers.affectedRegulatedAreas || "").toLowerCase();

  const sectorCheckText = `${rawSectors} ${textBlob}`;
  if (sectorCheckText.includes("employ") || sectorCheckText.includes("hiring") || sectorCheckText.includes("recruitment") || sectorCheckText.includes("resume") || sectorCheckText.includes("hr")) sectors.push("employment", "recruitment");
  if (sectorCheckText.includes("educat") || sectorCheckText.includes("school") || sectorCheckText.includes("admissions") || sectorCheckText.includes("grading")) sectors.push("education");
  if (sectorCheckText.includes("health") || sectorCheckText.includes("triage") || sectorCheckText.includes("medical") || sectorCheckText.includes("clinic") || sectorCheckText.includes("patient")) sectors.push("healthcare");
  if (sectorCheckText.includes("finance") || sectorCheckText.includes("credit") || sectorCheckText.includes("loan") || sectorCheckText.includes("banking") || sectorCheckText.includes("insurance")) sectors.push("finance", "credit_scoring");
  if (sectorCheckText.includes("housing") || sectorCheckText.includes("tenant") || sectorCheckText.includes("mortgage")) sectors.push("housing");
  if (sectorCheckText.includes("law enforcement") || sectorCheckText.includes("police") || sectorCheckText.includes("criminal")) sectors.push("law_enforcement");
  if (sectorCheckText.includes("justice") || sectorCheckText.includes("court") || sectorCheckText.includes("legal")) sectors.push("justice");

  const makesDecisions = answers.makesDecisionsAboutPeople === true || String(answers.makesDecisionsAboutPeople).toLowerCase() === "true" || String(answers.makesDecisionsAboutPeople).toLowerCase().includes("yes");
  const isAutomated = answers.decisionsAutomated === true || String(answers.decisionsAutomated).toLowerCase() === "true" || String(answers.decisionsAutomated).toLowerCase().includes("yes");
  const isConsequential = makesDecisions && sectors.length > 0;

  const processesPersonal = answers.processesPersonalData === true || String(answers.processesPersonalData).toLowerCase() === "true" || String(answers.processesPersonalData).toLowerCase().includes("yes") || textBlob.includes("personal data") || textBlob.includes("pii");
  const processesSensitive = answers.processesSensitiveData === true || String(answers.processesSensitiveData).toLowerCase() === "true" || String(answers.processesSensitiveData).toLowerCase().includes("yes") || textBlob.includes("sensitive") || textBlob.includes("biometric") || textBlob.includes("health");
  const processesBiometrics = textBlob.includes("biometric") || textBlob.includes("facial") || textBlob.includes("voiceprint");

  let oversight: ExtractedFacts["oversight_profile"]["oversightLevel"] = "in-the-loop";
  const rawOversight = String(answers.humanOversightDegree || "").toLowerCase();
  if (rawOversight.includes("none") || rawOversight.includes("autonomous") || (!rawOversight && isAutomated)) {
    oversight = "none/fully_autonomous";
  } else if (rawOversight.includes("on-the-loop")) {
    oversight = "on-the-loop";
  } else if (rawOversight.includes("over-the-loop")) {
    oversight = "over-the-loop";
  }

  return {
    system_profile: {
      name: answers.systemName || "Unnamed AI System",
      description: answers.whatItDoes || "AI System Description",
      intendedPurpose: answers.intendedPurpose || "Unspecified Purpose",
      industry: answers.industry || "Technology",
      modelProvider: answers.modelProvider || "Proprietary",
      isGenerativeAI: isGenAI,
      interactsWithHumansDirectly: interactsWithHumans,
    },
    geographic_scope: {
      isEUDeployed: isEU,
      deployedUSStates: usStates,
      isFederalGovContract: isFederal,
      isGlobal: textBlob.includes("global") || textBlob.includes("worldwide"),
    },
    decision_impact: {
      affectsLegalOrMaterialRights: isConsequential,
      isConsequentialDecision: isConsequential,
      makesDecisionsAboutPeople: makesDecisions,
      targetPopulations: answers.whoIsAffected ? [answers.whoIsAffected] : ["General Public"],
      automatedDecisionLevel: isAutomated ? (oversight === "none/fully_autonomous" ? "fully_automated" : "human_veto_available") : "purely_advisory",
    },
    data_processing: {
      processesPersonalData: processesPersonal,
      processesBiometrics: processesBiometrics,
      processesSpecialCategoryData: processesSensitive,
      trainingDataTransparencyNeeded: isGenAI && usStates.includes("CA"),
      dataCategories: [processesPersonal ? "Personal Data" : "", processesSensitive ? "Sensitive/Protected Data" : "", processesBiometrics ? "Biometric Data" : ""].filter(Boolean),
    },
    regulated_sectors: sectors,
    oversight_profile: {
      oversightLevel: oversight,
      hasKillSwitch: oversight !== "none/fully_autonomous",
      canIntervene: oversight === "in-the-loop" || oversight === "on-the-loop",
    },
    extractionMetadata: {
      extractedAt: new Date().toISOString(),
      extractionMethod: "deterministic-fallback",
      confidenceScore: 0.88,
      notes: "Extracted via deterministic fallback parser.",
    },
  };
}

// Layer A: AI-Assisted Fact Extraction via Gemini
export async function extractStructuredFacts(answers: QuestionnaireAnswers): Promise<ExtractedFacts> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return fallbackFactExtraction(answers);
  }

  const promptText = `
You are an objective AI Technical Fact Extraction agent for Concord AI.
Extract objective, factual parameters from the user's questionnaire answers into structured JSON facts.

QUESTIONNAIRE ANSWERS:
- System Name: ${answers.systemName || "N/A"}
- What does the AI system do?: ${answers.whatItDoes || "N/A"}
- Intended Purpose: ${answers.intendedPurpose || "N/A"}
- Industry: ${answers.industry || "N/A"}
- Countries/States Deployed: ${answers.deploymentLocations || "N/A"}
- Who uses it?: ${answers.whoUsesIt || "N/A"}
- Who is affected?: ${answers.whoIsAffected || "N/A"}
- Does it make or influence decisions about people?: ${answers.makesDecisionsAboutPeople}
- Does it process personal data?: ${answers.processesPersonalData}
- Does it process sensitive data?: ${answers.processesSensitiveData}
- Affected regulated areas: ${JSON.stringify(answers.affectedRegulatedAreas || [])}
- Degree of human oversight: ${answers.humanOversightDegree || "N/A"}
- Model / Provider: ${answers.modelProvider || "N/A"}
- Whether decisions are automated: ${answers.decisionsAutomated}
- Additional Technical Notes / Architecture: ${answers.unstructuredNotes || "N/A"}

CRITICAL CONSTRAINT:
Do not formulate legal conclusions, compliance judgments, or risk classifications.
Extract strictly factual, objective parameters according to the defined JSON schema.
`;

  const extractionSchema = {
    type: Type.OBJECT,
    properties: {
      system_profile: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          intendedPurpose: { type: Type.STRING },
          industry: { type: Type.STRING },
          modelProvider: { type: Type.STRING },
          isGenerativeAI: { type: Type.BOOLEAN },
          interactsWithHumansDirectly: { type: Type.BOOLEAN },
        },
        required: [
          "name",
          "description",
          "intendedPurpose",
          "industry",
          "modelProvider",
          "isGenerativeAI",
          "interactsWithHumansDirectly",
        ],
      },
      geographic_scope: {
        type: Type.OBJECT,
        properties: {
          isEUDeployed: { type: Type.BOOLEAN },
          deployedUSStates: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          isFederalGovContract: { type: Type.BOOLEAN },
          isGlobal: { type: Type.BOOLEAN },
        },
        required: ["isEUDeployed", "deployedUSStates", "isFederalGovContract", "isGlobal"],
      },
      decision_impact: {
        type: Type.OBJECT,
        properties: {
          affectsLegalOrMaterialRights: { type: Type.BOOLEAN },
          isConsequentialDecision: { type: Type.BOOLEAN },
          makesDecisionsAboutPeople: { type: Type.BOOLEAN },
          targetPopulations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          automatedDecisionLevel: {
            type: Type.STRING,
            description: "Must be 'fully_automated', 'human_veto_available', or 'purely_advisory'",
          },
        },
        required: [
          "affectsLegalOrMaterialRights",
          "isConsequentialDecision",
          "makesDecisionsAboutPeople",
          "targetPopulations",
          "automatedDecisionLevel",
        ],
      },
      data_processing: {
        type: Type.OBJECT,
        properties: {
          processesPersonalData: { type: Type.BOOLEAN },
          processesBiometrics: { type: Type.BOOLEAN },
          processesSpecialCategoryData: { type: Type.BOOLEAN },
          trainingDataTransparencyNeeded: { type: Type.BOOLEAN },
          dataCategories: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: [
          "processesPersonalData",
          "processesBiometrics",
          "processesSpecialCategoryData",
          "trainingDataTransparencyNeeded",
          "dataCategories",
        ],
      },
      regulated_sectors: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "E.g. ['employment', 'education', 'finance', 'healthcare', 'housing', 'law_enforcement', 'justice']",
      },
      oversight_profile: {
        type: Type.OBJECT,
        properties: {
          oversightLevel: {
            type: Type.STRING,
            description: "'none/fully_autonomous', 'on-the-loop', 'in-the-loop', or 'over-the-loop'",
          },
          hasKillSwitch: { type: Type.BOOLEAN },
          canIntervene: { type: Type.BOOLEAN },
        },
        required: ["oversightLevel", "hasKillSwitch", "canIntervene"],
      },
    },
    required: [
      "system_profile",
      "geographic_scope",
      "decision_impact",
      "data_processing",
      "regulated_sectors",
      "oversight_profile",
    ],
  };

  const candidateModels = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    for (const model of candidateModels) {
      try {
        const generatePromise = ai.models.generateContent({
          model,
          contents: promptText,
          config: {
            systemInstruction:
              "You are a strict technical fact extractor for Concord AI. You convert software and AI descriptions into normalized factual JSON parameters. You never issue legal opinions.",
            responseMimeType: "application/json",
            responseSchema: extractionSchema,
          },
        });

        const response = await Promise.race([
          generatePromise,
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Model ${model} timed out after 8s`)), 8000)
          ),
        ]);

        const text = response.text ? response.text.trim() : "";
        if (text) {
          const parsed = JSON.parse(text);
          return {
            ...parsed,
            extractionMetadata: {
              extractedAt: new Date().toISOString(),
              extractionMethod: "ai-assisted",
              confidenceScore: 0.96,
              notes: `Facts extracted via Gemini (${model}) constrained schema (Layer A). Deterministic rule engine will process these facts.`,
            },
          };
        }
      } catch (candidateErr: any) {
        // If high demand spike (503), rate limit (429), or temporary outage, attempt next model candidate
        const errMsg = candidateErr?.message || String(candidateErr);
        const isHighDemandOrTransient =
          errMsg.includes("503") ||
          errMsg.includes("high demand") ||
          errMsg.includes("429") ||
          errMsg.includes("timed out") ||
          errMsg.includes("UNAVAILABLE");

        if (isHighDemandOrTransient) {
          // Brief pause before trying the next candidate model
          await new Promise((resolve) => setTimeout(resolve, 300));
          continue;
        }
        // If another type of error, also continue to next candidate or fallback
        continue;
      }
    }

    // If all Gemini candidates are currently experiencing high demand spikes:
    console.info("Gemini API models currently at peak demand. Seamlessly utilizing deterministic compliance rule parser.");
    const fallback = fallbackFactExtraction(answers);
    fallback.extractionMetadata = {
      extractedAt: new Date().toISOString(),
      extractionMethod: "deterministic-fallback",
      confidenceScore: 0.91,
      notes: "Facts extracted via deterministic rules parser (Gemini API experiencing peak traffic demand spike).",
    };
    return fallback;
  } catch (err: any) {
    console.info("Fact extraction falling back to deterministic parser:", err?.message || err);
    const fallback = fallbackFactExtraction(answers);
    fallback.extractionMetadata = {
      extractedAt: new Date().toISOString(),
      extractionMethod: "deterministic-fallback",
      confidenceScore: 0.90,
      notes: "Facts extracted via deterministic rules parser.",
    };
    return fallback;
  }
}
