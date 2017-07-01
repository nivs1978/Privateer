function Toolkit()
{
    this.getDefaultToolkit = function()
    {
        var defaulttoolkit = function () { }
        defaulttoolkit.beep()= function() {
            console.log("beep()");
        }
        return defaulttoolkit;
    }
    
}
