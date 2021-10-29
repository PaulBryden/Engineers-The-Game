interface IStatePublisher
{
     subscribe(sub:IStateSubscriber): void;
     unsubscribe(sub:IStateSubscriber): void;
}

interface  IStateSubscriber
{
     notify(state:string) : void;
}

export {IStatePublisher, IStateSubscriber}