from typing import Dict, Any, List

def consult_legal_advisor(question: str, land_identity_id: str = None, risk_findings: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    BhoomiShield AI Legal Advisor engine.
    Specializes in Indian Land Law and Jharkhand Revenue Acts:
    - CNT Act 1908 (Chota Nagpur Tenancy Act)
    - SPT Act 1949 (Santhal Parganas Tenancy Act)
    - Jharkhand Land Mutation Act 2011
    - Registration Act 1908 & Specific Relief Act 1963
    """
    q_lower = question.lower()

    # 1. CNT Act 1908 Queries (Tribal land transfer restrictions)
    if any(k in q_lower for k in ["cnt", "chota nagpur", "tribal", "st", "sc", "section 46", "section 71a", "raiyat"]):
        answer = (
            "⚖️ **Legal Guidance under Chota Nagpur Tenancy (CNT) Act 1908**:\n\n"
            "1. **Section 46 Transfer Restrictions**: Transfer of occupancy holdings by Scheduled Tribes (ST) to non-STs is strictly prohibited without prior written sanction of the Deputy Commissioner (DC).\n"
            "2. **Section 71A Restoration**: If land belonging to a tribal raiyat was illegally transferred or mutated in violation of CNT Act rules, the Deputy Commissioner has powers to evict the illegal occupant and restore possession to the original raiyat or legal heirs.\n"
            "3. **Legal Precedent**: Supreme Court judgment in *Amrendra Pratap Singh vs. Tej Bahadur Singh* affirms that statutory land transfer restrictions under CNT Act cannot be bypassed through power of attorney or unmutated deeds.\n\n"
            "**Recommended Action**: Verify the caste category in original Sabik Khatian before purchasing land in Chota Nagpur division (Bokaro, Ranchi, Dhanbad, Hazaribagh)."
        )
        law_ref = "CNT Act 1908 (Section 46 & 71A)"

    # 2. SPT Act 1949 Queries (Santhal Parganas division)
    elif any(k in q_lower for k in ["spt", "santhal", "section 20", "dumka", "godda", "deoghar"]):
        answer = (
            "⚖️ **Legal Guidance under Santhal Parganas Tenancy (SPT) Act 1949**:\n\n"
            "1. **Section 20 Non-Transferability**: Raiyati land in Santhal Parganas is non-transferable by sale, gift, mortgage, or lease unless recorded as transferable in the Record-of-Rights (Khatian).\n"
            "2. **Illegal Transfer Consequences**: Any sale deed or agreement executed in violation of Section 20 is null and void *ab initio*, and the Circle Officer/SDO can initiate summary eviction procedures.\n\n"
            "**Recommended Action**: Check if the Mauza falls under SPT Act jurisdiction and verify whether transferability is explicitly granted in Khatian records."
        )
        law_ref = "SPT Act 1949 (Section 20 & 56)"

    # 3. Mutation Rules 2011 & Overdue SLA Remedies
    elif any(k in q_lower for k in ["mutation", "delay", "sla", "pending", "co", "lrdc", "dakhil kharij", "officer"]):
        answer = (
            "⚖️ **Legal Remedy under Jharkhand Land Mutation Rules 2011**:\n\n"
            "1. **Statutory SLA**: Under Jharkhand Right to Service Act & Mutation Rules, Circle Officers (CO) must dispose of undisputed mutation cases within **30 Days** (or 90 days for disputed cases).\n"
            "2. **Appeal Process (Section 7)**: If the CO rejects your mutation or delays beyond 30 days without justification, file a First Appeal before the **Land Reforms Deputy Collector (LRDC)** within 30 days.\n"
            "3. **Second Appeal & Revision**: Order of LRDC can be challenged before the Additional Collector / District Collector.\n\n"
            "**Action Steps**:\n"
            "• Generate BhoomiShield Mutation SLA Delay Evidence Notice.\n"
            "• Submit formal grievance complaint to LRDC mentioning Application No and days overdue."
        )
        law_ref = "Jharkhand Land Mutation Act 2011 (Section 6 & 7)"

    # 4. Unmutated Deeds & Owner Mismatch (R001 / R006)
    elif any(k in q_lower for k in ["deed", "mismatch", "unmutated", "buyer", "seller", "registration", "title"]):
        answer = (
            "⚖️ **Legal Guidance on Registered Deeds vs Mutation (Registration Act 1908)**:\n\n"
            "1. **Registration vs Title**: Registration of a Sale Deed under Section 17 of the Registration Act transfers contractual title, but **Register-II mutation** is mandatory to update tenant records and pay government revenue lagan.\n"
            "2. **Risk of Unmutated Deed**: If a seller sells land to Buyer A (Deed registered) but Register-II is not mutated, the seller remains registered owner in government records and could fraudulently attempt resale.\n"
            "3. **Remedy**: File an urgent Dakhil-Kharij (Mutation) application attaching certified deed copy, possession proof, and lagan receipt."
        )
        law_ref = "Registration Act 1908 & Bihar/Jharkhand Tenant Roll Rules"

    # 5. Court Disputes & Stay Orders (R007)
    elif any(k in q_lower for k in ["court", "stay", "dispute", "litigation", "injunction", "suit"]):
        answer = (
            "⚖️ **Legal Guidance on Active Court Litigation (Specific Relief Act 1963)**:\n\n"
            "1. **Doctrine of Lis Pendens (Section 52 TPA)**: Property under active litigation in Civil or Revenue Court cannot be transferred or encumbered so as to affect the rights of any party under any decree.\n"
            "2. **Temporary Injunction**: If a Stay Order / Status Quo is granted by Court, any transaction or mutation attempted during the stay period is illegal and punishable under Contempt of Courts Act.\n\n"
            "**Recommended Action**: Obtain certified copy of Order Sheet from Revenue Court / Civil Court before proceeding."
        )
        law_ref = "Transfer of Property Act (Section 52) & Civil Procedure Code (Order 39)"

    # Default Legal Advisor Response
    else:
        answer = (
            "⚖️ **BhoomiShield Legal AI Guidance**:\n\n"
            "Indian Land Laws require strict verification of original Sabik/Revisional Khatian, Register-II volume entries, unmutated sale deeds, tribal land restrictions (CNT/SPT Act), and active court litigation.\n\n"
            "You can ask me specifically about:\n"
            "• Tribal land transfer restrictions under **CNT Act Section 46**\n"
            "• Remedies for **Mutation delays beyond statutory 30-day SLA**\n"
            "• Legal status of **Unmutated Sale Deeds**\n"
            "• Filing appeals before **LRDC & District Collector**"
        )
        law_ref = "Indian Land Revenue & Property Jurisprudence"

    return {
        "question": question,
        "legal_advice": answer,
        "statutory_reference": law_ref,
        "disclaimer": "This legal guidance is generated by BhoomiShield AI based on statutory acts. It is for informational assistance and does not constitute formal legal counsel."
    }
