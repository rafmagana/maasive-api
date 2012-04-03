set :deploy_to, "#{app_parent_path}/api.staging.your_maasive_domain.com"

server 'your_staging_server', :app, :web, :primary => true
