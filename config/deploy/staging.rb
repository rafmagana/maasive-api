set :user, 'deploy'
# set :password, "p0rtland10"
set :deploy_to, "/srv/www/api.staging.maasive.co"
set :use_sudo, false

set :repository, "git@github-api:elc/MaaSiveAPI.git"

server 'maas-devel.elctech.net', :app, :web, :primary => true
