using System;
using Model.Tagging;

namespace Model.Compiler
{
    public interface IBaseConceptSpecialization
    {
        Guid Id { get; set; }
        SpecializationUrn UniversalId { get; set; }
        int SpecializationGroupId { get; set; }
        string UiDisplayText { get; set; }
        int OrderId { get; set; }
    }

    public abstract class BaseConceptSpecialization : IBaseConceptSpecialization
    {
        public Guid Id { get; set; }
        public SpecializationUrn UniversalId { get; set; }
        public int SpecializationGroupId { get; set; }
        public string UiDisplayText { get; set; }
        public int OrderId { get; set; }

        protected BaseConceptSpecialization()
        {

        }

        protected BaseConceptSpecialization(ConceptSpecialization cs)
        {
            Id = cs.Id;
            UniversalId = cs.UniversalId;
            SpecializationGroupId = cs.SpecializationGroupId;
            UiDisplayText = cs.UiDisplayText;
            OrderId = cs.OrderId;
        }
    }

    public interface IConceptSpecializationDTO : IBaseConceptSpecialization
    {
        new string UniversalId { get; set; }
    }
}