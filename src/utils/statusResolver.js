class ReturnPolicy {
    resolveStatus(condition) {
        throw new Error(" Mathod 'resolveStatus()' must be implemented.");
    }
}// every return policy must have a resolveStatus()...bascially this is a template

class StandardReturnPolicy extends ReturnPolicy {
    resolveStatus(condition) {
        if (condition === "Damaged") {
            return "Damaged";
        }
        return "Available";
    }
}

class SensitiveReturnPolicy extends ReturnPolicy {
    resolveStatus(condition) {
        if (condition === "Damaged") {
            return "Damaged";
        }
        return "Under Maintenance";
    }
}

class ConsumablesReturnPolicy extends ReturnPolicy {
    resolveStatus(condition) {
        if (condition === "Damaged") {
            return "Decomissioned";
        }

        return "Available";
    }
}

const policyRegister = {
    default: new StandardReturnPolicy(),
    Laptop: new StandardReturnPolicy(),
    Projector: new SensitiveReturnPolicy(),
    cables: new ConsumablesReturnPolicy(),
    Desktop: new StandardReturnPolicy(),
    Camera: new SensitiveReturnPolicy(),

    Standard: new StandardReturnPolicy(),
    Sensitive: new SensitiveReturnPolicy(),
    Consumable: new ConsumablesReturnPolicy()
}



export default function getReturnPolicy(category) {
    return policyRegister[category] || policyRegister.default;
}

