using System;
namespace Services.Compiler
{
    public class RawConceptHint
    {
        public Guid Id
        {
            get;
            set;
        }

        public string Term
        {
            get;
            set;
        }

        public Guid RootId
        {
            get;
            set;
        }
    }
}
